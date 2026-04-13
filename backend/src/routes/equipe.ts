import { Router, type IRouter } from "express";
import { db, usuariosTable, equipesTable } from "../db/index.js";
import { eq, desc, ne } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

// GET /equipe/membros — list all team members (excluding passwords)
router.get("/membros", authMiddleware, async (req: AuthRequest, res) => {
  const membros = await db
    .select({
      id: usuariosTable.id,
      nome: usuariosTable.nome,
      email: usuariosTable.email,
      telefone: usuariosTable.telefone,
      role: usuariosTable.role,
      status: usuariosTable.status,
      ultimoAcesso: usuariosTable.ultimoAcesso,
      criadoEm: usuariosTable.criadoEm,
      equipeId: usuariosTable.equipeId,
      equipe: {
        id: equipesTable.id,
        nome: equipesTable.nome,
        cor: equipesTable.cor,
      },
    })
    .from(usuariosTable)
    .leftJoin(equipesTable, eq(usuariosTable.equipeId, equipesTable.id))
    .orderBy(desc(usuariosTable.criadoEm));

  res.json(membros);
});

// GET /equipe/membros/:id — single member
router.get("/membros/:id", authMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [membro] = await db
    .select({
      id: usuariosTable.id,
      nome: usuariosTable.nome,
      email: usuariosTable.email,
      telefone: usuariosTable.telefone,
      role: usuariosTable.role,
      status: usuariosTable.status,
      ultimoAcesso: usuariosTable.ultimoAcesso,
      criadoEm: usuariosTable.criadoEm,
      equipeId: usuariosTable.equipeId,
    })
    .from(usuariosTable)
    .where(eq(usuariosTable.id, id))
    .limit(1);

  if (!membro) {
    res.status(404).json({ error: "not_found", message: "Membro não encontrado" });
    return;
  }
  res.json(membro);
});

// POST /equipe/membros — create/invite new member
router.post("/membros", authMiddleware, async (req: AuthRequest, res) => {
  const { nome, email, senha, telefone, role, equipeId } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({ error: "bad_request", message: "Nome, email e senha são obrigatórios" });
    return;
  }

  const existing = await db.select().from(usuariosTable).where(eq(usuariosTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "email_exists", message: "Este email já está em uso" });
    return;
  }

  const senhaHash = await bcrypt.hash(senha || "vigora@2024", 10);
  const [membro] = await db
    .insert(usuariosTable)
    .values({ nome, email, telefone, senhaHash, role: role || "advogado", equipeId: equipeId || null })
    .returning();

  res.status(201).json({
    id: membro.id,
    nome: membro.nome,
    email: membro.email,
    role: membro.role,
    status: membro.status,
    criadoEm: membro.criadoEm,
  });
});

// PUT /equipe/membros/:id — update member role/status/equipe
router.put("/membros/:id", authMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { nome, telefone, role, status, equipeId } = req.body;

  const [updated] = await db
    .update(usuariosTable)
    .set({
      ...(nome && { nome }),
      ...(telefone !== undefined && { telefone }),
      ...(role && { role }),
      ...(status && { status }),
      ...(equipeId !== undefined && { equipeId: equipeId || null }),
    })
    .where(eq(usuariosTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "not_found", message: "Membro não encontrado" });
    return;
  }

  res.json({
    id: updated.id,
    nome: updated.nome,
    email: updated.email,
    role: updated.role,
    status: updated.status,
  });
});

// DELETE /equipe/membros/:id — deactivate (soft delete)
router.delete("/membros/:id", authMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  await db.update(usuariosTable).set({ status: "inativo" }).where(eq(usuariosTable.id, id));
  res.json({ success: true, message: "Membro desativado" });
});

// GET /equipe/times — list all teams
router.get("/times", authMiddleware, async (_req, res) => {
  const times = await db.select().from(equipesTable).orderBy(desc(equipesTable.criadoEm));
  res.json(times);
});

// POST /equipe/times — create team
router.post("/times", authMiddleware, async (req: AuthRequest, res) => {
  const { nome, descricao, cor } = req.body;
  if (!nome) {
    res.status(400).json({ error: "bad_request", message: "Nome da equipe é obrigatório" });
    return;
  }
  const [time] = await db.insert(equipesTable).values({ nome, descricao, cor: cor || "#4f46e5" }).returning();
  res.status(201).json(time);
});

// PUT /equipe/times/:id — update team
router.put("/times/:id", authMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { nome, descricao, cor } = req.body;
  const [updated] = await db
    .update(equipesTable)
    .set({ ...(nome && { nome }), ...(descricao !== undefined && { descricao }), ...(cor && { cor }) })
    .where(eq(equipesTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "not_found", message: "Equipe não encontrada" });
    return;
  }
  res.json(updated);
});

// DELETE /equipe/times/:id
router.delete("/times/:id", authMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  // Unlink members first
  await db.update(usuariosTable).set({ equipeId: null }).where(eq(usuariosTable.equipeId, id));
  await db.delete(equipesTable).where(eq(equipesTable.id, id));
  res.json({ success: true });
});

export default router;
