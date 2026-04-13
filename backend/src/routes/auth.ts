import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usuariosTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { authMiddleware, generateToken, AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    res.status(400).json({ error: "bad_request", message: "Email e senha são obrigatórios" });
    return;
  }

  const [user] = await db.select().from(usuariosTable).where(eq(usuariosTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "invalid_credentials", message: "Email ou senha incorretos" });
    return;
  }

  const valid = await bcrypt.compare(senha, user.senhaHash);
  if (!valid) {
    res.status(401).json({ error: "invalid_credentials", message: "Email ou senha incorretos" });
    return;
  }

  const token = generateToken(user.id, user.email);
  res.json({
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      criadoEm: user.criadoEm,
    },
    token,
  });
});

router.post("/register", async (req, res) => {
  const { nome, email, telefone, senha } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({ error: "bad_request", message: "Nome, email e senha são obrigatórios" });
    return;
  }

  const existing = await db.select().from(usuariosTable).where(eq(usuariosTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "email_exists", message: "Este email já está em uso" });
    return;
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const [user] = await db.insert(usuariosTable).values({ nome, email, telefone, senhaHash }).returning();

  const token = generateToken(user.id, user.email);
  res.status(201).json({
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      criadoEm: user.criadoEm,
    },
    token,
  });
});

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  const [user] = await db.select().from(usuariosTable).where(eq(usuariosTable.id, req.userId!)).limit(1);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Usuário não encontrado" });
    return;
  }
  res.json({
    id: user.id,
    nome: user.nome,
    email: user.email,
    telefone: user.telefone,
    criadoEm: user.criadoEm,
  });
});

export default router;
