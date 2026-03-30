import { Router, type IRouter } from "express";
import { db, tarefasTable, processosTable, alertasTable } from "../db/index.js";
import { eq, and } from "drizzle-orm";
import { authMiddleware, AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();
router.use(authMiddleware as any);

router.get("/", async (req: AuthRequest, res) => {
  const { status, processoId } = req.query as { status?: string; processoId?: string };

  let tarefas = await db.select().from(tarefasTable).where(eq(tarefasTable.usuarioId, req.userId!));

  if (status) {
    tarefas = tarefas.filter(t => t.status === status);
  }
  if (processoId) {
    tarefas = tarefas.filter(t => t.processoId === parseInt(processoId));
  }

  const result = await Promise.all(tarefas.map(async (tarefa) => {
    let processo = null;
    if (tarefa.processoId) {
      const [proc] = await db.select({
        id: processosTable.id,
        numeroProcesso: processosTable.numeroProcesso,
        area: processosTable.area,
        status: processosTable.status,
      }).from(processosTable).where(eq(processosTable.id, tarefa.processoId)).limit(1);
      processo = proc || null;
    }
    return { ...tarefa, processo };
  }));

  res.json(result);
});

router.post("/", async (req: AuthRequest, res) => {
  const { titulo, descricao, processoId, prazoId, responsavel, dataLimite, status } = req.body;

  if (!titulo || !status) {
    res.status(400).json({ error: "bad_request", message: "Título e status são obrigatórios" });
    return;
  }

  const [tarefa] = await db.insert(tarefasTable).values({
    titulo, descricao,
    processoId: processoId || null,
    prazoId: prazoId || null,
    responsavel, dataLimite: dataLimite || null, status,
    usuarioId: req.userId!
  }).returning();

  res.status(201).json(tarefa);
});

router.get("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const [tarefa] = await db.select().from(tarefasTable).where(
    and(eq(tarefasTable.id, id), eq(tarefasTable.usuarioId, req.userId!))
  ).limit(1);

  if (!tarefa) {
    res.status(404).json({ error: "not_found", message: "Tarefa não encontrada" });
    return;
  }

  let processo = null;
  if (tarefa.processoId) {
    const [proc] = await db.select({
      id: processosTable.id,
      numeroProcesso: processosTable.numeroProcesso,
      area: processosTable.area,
      status: processosTable.status,
    }).from(processosTable).where(eq(processosTable.id, tarefa.processoId)).limit(1);
    processo = proc || null;
  }

  res.json({ ...tarefa, processo });
});

router.put("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { titulo, descricao, processoId, prazoId, responsavel, dataLimite, status } = req.body;

  const [existing] = await db.select().from(tarefasTable).where(
    and(eq(tarefasTable.id, id), eq(tarefasTable.usuarioId, req.userId!))
  ).limit(1);

  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Tarefa não encontrada" });
    return;
  }

  if (status === "concluida" && existing.status !== "concluida") {
    await db.insert(alertasTable).values({
      tipo: "tarefa_concluida",
      mensagem: `Tarefa concluída: ${existing.titulo}`,
      referenciaId: id,
      referenciaTipo: "tarefa",
      lido: false,
      usuarioId: req.userId!
    });
  }

  const [updated] = await db.update(tarefasTable).set({
    titulo, descricao,
    processoId: processoId || null,
    prazoId: prazoId || null,
    responsavel, dataLimite: dataLimite || null, status
  }).where(eq(tarefasTable.id, id)).returning();

  res.json(updated);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  await db.delete(tarefasTable).where(
    and(eq(tarefasTable.id, id), eq(tarefasTable.usuarioId, req.userId!))
  );
  res.status(204).send();
});

export default router;
