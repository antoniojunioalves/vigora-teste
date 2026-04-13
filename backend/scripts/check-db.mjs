import process from "node:process";
import pg from "pg";

process.loadEnvFile?.(".env");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL não encontrado em backend/.env");
  process.exit(1);
}

const { Client } = pg;

const client = new Client({ connectionString: databaseUrl });

async function main() {
  await client.connect();

  const connectionInfo = await client.query(`
    select
      current_database() as database,
      current_user as user,
      inet_server_addr()::text as server_addr,
      inet_server_port() as server_port
  `);

  const tables = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `);

  const usuariosExists = await client.query(`
    select exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = 'usuarios'
    ) as exists
  `);

  console.log("Conexao OK");
  console.table(connectionInfo.rows);

  if (tables.rows.length === 0) {
    console.log("Nenhuma tabela encontrada no schema public.");
  } else {
    console.log("Tabelas encontradas:");
    console.table(tables.rows);
  }

  if (usuariosExists.rows[0]?.exists) {
    const usuariosColumns = await client.query(`
      select column_name, data_type, is_nullable
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'usuarios'
      order by ordinal_position
    `);

    console.log("Colunas da tabela usuarios:");
    console.table(usuariosColumns.rows);
  } else {
    console.log("Tabela usuarios não encontrada.");
  }
}

main()
  .catch((error) => {
    console.error("Falha ao validar DATABASE_URL.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end().catch(() => {});
  });
