import { Router, type IRouter } from "express";
import { db, clientesTable, processosTable, prazosTable } from "../db/index.js";
import { eq, ilike, and } from "drizzle-orm";
import { authMiddleware, AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();
router.use(authMiddleware as any);

router.get("/", async (req: AuthRequest, res) => {
  const { search } = req.query as { search?: string };
  let clientes;
  if (search) {
    clientes = await db.select().from(clientesTable).where(
      and(
        eq(clientesTable.usuarioId, req.userId!),
        ilike(clientesTable.nome, `%${search}%`)
      )
    );
  } else {
    clientes = await db.select().from(clientesTable).where(eq(clientesTable.usuarioId, req.userId!));
  }
  res.json(clientes);
});

router.post("/", async (req: AuthRequest, res) => {
  const { nome, cpfCnpj, telefone, email, observacoes } = req.body;
  if (!nome) {
    res.status(400).json({ error: "bad_request", message: "Nome é obrigatório" });
    return;
  }
  const [cliente] = await db.insert(clientesTable).values({
    nome, cpfCnpj, telefone, email, observacoes, usuarioId: req.userId!
  }).returning();
  res.status(201).json(cliente);
});

router.get("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const [cliente] = await db.select().from(clientesTable).where(
    and(eq(clientesTable.id, id), eq(clientesTable.usuarioId, req.userId!))
  ).limit(1);

  if (!cliente) {
    res.status(404).json({ error: "not_found", message: "Cliente não encontrado" });
    return;
  }

  const processos = await db.select({
    id: processosTable.id,
    numeroProcesso: processosTable.numeroProcesso,
    area: processosTable.area,
    status: processosTable.status,
  }).from(processosTable).where(eq(processosTable.clienteId, id));

  const prazos = await db.select({
    id: prazosTable.id,
    tipo: prazosTable.tipo,
    dataLimite: prazosTable.dataLimite,
    status: prazosTable.status,
    prioridade: prazosTable.prioridade,
  }).from(prazosTable).where(eq(prazosTable.usuarioId, req.userId!));

  res.json({ ...cliente, processos, prazos });
});

router.put("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { nome, cpfCnpj, telefone, email, observacoes } = req.body;

  const [existing] = await db.select().from(clientesTable).where(
    and(eq(clientesTable.id, id), eq(clientesTable.usuarioId, req.userId!))
  ).limit(1);

  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Cliente não encontrado" });
    return;
  }

  const [updated] = await db.update(clientesTable).set({ nome, cpfCnpj, telefone, email, observacoes })
    .where(eq(clientesTable.id, id)).returning();
  res.json(updated);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  await db.delete(clientesTable).where(
    and(eq(clientesTable.id, id), eq(clientesTable.usuarioId, req.userId!))
  );
  res.status(204).send();
});

export default router;
