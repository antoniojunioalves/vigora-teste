import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild, context as createEsbuildContext } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm } from "node:fs/promises";

// Plugins (e.g. 'esbuild-plugin-pino') may use `require` to resolve dependencies
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(artifactDir, "dist");
const isWatchMode = process.argv.includes("--watch");

let currentServerProcess = null;
let isShuttingDown = false;
let restartQueue = Promise.resolve();

function createBuildOptions(extraPlugins = []) {
  return {
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    // Some packages may not be bundleable, so we externalize them, we can add more here as needed.
    // Some of the packages below may not be imported or installed, but we're adding them in case they are in the future.
    // Examples of unbundleable packages:
    // - uses native modules and loads them dynamically (e.g. sharp)
    // - use path traversal to read files (e.g. @google-cloud/secret-manager loads sibling .proto files)
    external: [
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "xxhash-addon",
      "bufferutil",
      "utf-8-validate",
      "ssh2",
      "cpu-features",
      "dtrace-provider",
      "isolated-vm",
      "lightningcss",
      "pg-native",
      "oracledb",
      "mongodb-client-encryption",
      "nodemailer",
      "handlebars",
      "knex",
      "typeorm",
      "protobufjs",
      "onnxruntime-node",
      "@tensorflow/*",
      "@prisma/client",
      "@mikro-orm/*",
      "@grpc/*",
      "@swc/*",
      "@aws-sdk/*",
      "@azure/*",
      "@opentelemetry/*",
      "@google-cloud/*",
      "@google/*",
      "googleapis",
      "firebase-admin",
      "@parcel/watcher",
      "@sentry/profiling-node",
      "@tree-sitter/*",
      "aws-sdk",
      "classic-level",
      "dd-trace",
      "ffi-napi",
      "grpc",
      "hiredis",
      "kerberos",
      "leveldown",
      "miniflare",
      "mysql2",
      "newrelic",
      "odbc",
      "piscina",
      "realm",
      "ref-napi",
      "rocksdb",
      "sass-embedded",
      "sequelize",
      "serialport",
      "snappy",
      "tinypool",
      "usb",
      "workerd",
      "wrangler",
      "zeromq",
      "zeromq-prebuilt",
      "playwright",
      "puppeteer",
      "puppeteer-core",
      "electron",
    ],
    sourcemap: "linked",
    plugins: [
      // pino relies on workers to handle logging, instead of externalizing it we use a plugin to handle it
      esbuildPluginPino({ transports: ["pino-pretty"] }),
      ...extraPlugins,
    ],
    // Make sure packages that are cjs only (e.g. express) but are bundled continue to work in our esm output file
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    `,
    },
  };
}

async function cleanDistDir() {
  await rm(distDir, { recursive: true, force: true });
}

function stopServer() {
  if (!currentServerProcess) {
    return Promise.resolve();
  }

  const serverProcess = currentServerProcess;
  currentServerProcess = null;

  if (serverProcess.exitCode !== null || serverProcess.signalCode !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const forceStopTimer = setTimeout(() => {
      serverProcess.kill("SIGKILL");
    }, 5_000);

    serverProcess.once("exit", () => {
      clearTimeout(forceStopTimer);
      resolve();
    });

    serverProcess.kill("SIGTERM");
  });
}

function startServer() {
  if (isShuttingDown) {
    return;
  }

  const serverProcess = spawn(
    process.execPath,
    ["--env-file=.env", "--enable-source-maps", "./dist/index.mjs"],
    {
      cwd: artifactDir,
      stdio: "inherit",
      env: process.env,
    },
  );

  currentServerProcess = serverProcess;

  serverProcess.once("exit", (code, signal) => {
    if (currentServerProcess?.pid === serverProcess.pid) {
      currentServerProcess = null;
    }

    if (
      isShuttingDown ||
      signal === "SIGTERM" ||
      code === 0 ||
      code === null
    ) {
      return;
    }

    console.error(`[dev] Server exited with code ${code}. Waiting for rebuild...`);
  });
}

function restartServer() {
  restartQueue = restartQueue.then(async () => {
    await stopServer();
    startServer();
  });

  return restartQueue;
}

function createRestartServerPlugin() {
  return {
    name: "restart-server-on-build",
    setup(build) {
      build.onEnd(async (result) => {
        if (result.errors.length > 0) {
          console.error("[dev] Build failed. Server was not restarted.");
          return;
        }

        await restartServer();
      });
    },
  };
}

function registerShutdown(cleanup) {
  const handleSignal = async (signal) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    await cleanup();
    process.exit(signal === "SIGINT" ? 130 : 0);
  };

  process.on("SIGINT", () => {
    void handleSignal("SIGINT");
  });

  process.on("SIGTERM", () => {
    void handleSignal("SIGTERM");
  });
}

async function buildAll() {
  await cleanDistDir();
  await esbuild(createBuildOptions());
}

async function watchAndServe() {
  await cleanDistDir();

  const context = await createEsbuildContext(
    createBuildOptions([createRestartServerPlugin()]),
  );

  registerShutdown(async () => {
    await context.dispose();
    await stopServer();
  });

  await context.watch();
  console.log("[dev] Watching backend source files...");
}

const runner = isWatchMode ? watchAndServe : buildAll;

runner().catch((err) => {
  console.error(err);
  process.exit(1);
});
