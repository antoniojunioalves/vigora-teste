import { Router, type IRouter } from "express";
import { db, processosTable, clientesTable, prazosTable, tarefasTable } from "../db/index.js";
import { eq, ilike, and } from "drizzle-orm";
import { authMiddleware, AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();
router.use(authMiddleware as any);

async function getProximoPrazo(processoId: number) {
  const today = new Date().toISOString().split("T")[0];
  const prazos = await db.select().from(prazosTable).where(
    and(eq(prazosTable.processoId, processoId))
  );
  const futuros = prazos
    .filter(p => p.dataLimite >= today && p.status !== "concluido")
    .sort((a, b) => a.dataLimite.localeCompare(b.dataLimite));
  return futuros[0] || null;
}

router.get("/", async (req: AuthRequest, res) => {
  const { search, status, area } = req.query as { search?: string; status?: string; area?: string };

  let processos = await db.select().from(processosTable).where(eq(processosTable.usuarioId, req.userId!));

  if (search) {
    processos = processos.filter(p =>
      p.numeroProcesso.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (status) {
    processos = processos.filter(p => p.status === status);
  }
  if (area) {
    processos = processos.filter(p => p.area === area);
  }

  const result = await Promise.all(processos.map(async (processo) => {
    let cliente = null;
    if (processo.clienteId) {
      const [c] = await db.select().from(clientesTable).where(eq(clientesTable.id, processo.clienteId)).limit(1);
      cliente = c || null;
    }
    const proximoPrazo = await getProximoPrazo(processo.id);
    return { ...processo, cliente, proximoPrazo, prazos: [], tarefas: [] };
  }));

  res.json(result);
});

router.post("/", async (req: AuthRequest, res) => {
  const { numeroProcesso, tribunal, area, status, observacoes, clienteId, responsavelId } = req.body;

  if (!numeroProcesso || !status) {
    res.status(400).json({ error: "bad_request", message: "Número do processo e status são obrigatórios" });
    return;
  }

  const [processo] = await db.insert(processosTable).values({
    numeroProcesso, tribunal, area, status, observacoes,
    clienteId: clienteId || null,
    responsavelId: responsavelId || null,
    usuarioId: req.userId!
  }).returning();

  res.status(201).json(processo);
});

router.get("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const [processo] = await db.select().from(processosTable).where(
    and(eq(processosTable.id, id), eq(processosTable.usuarioId, req.userId!))
  ).limit(1);

  if (!processo) {
    res.status(404).json({ error: "not_found", message: "Processo não encontrado" });
    return;
  }

  let cliente = null;
  if (processo.clienteId) {
    const [c] = await db.select().from(clientesTable).where(eq(clientesTable.id, processo.clienteId)).limit(1);
    cliente = c || null;
  }

  const prazos = await db.select().from(prazosTable).where(eq(prazosTable.processoId, id));
  const tarefas = await db.select().from(tarefasTable).where(eq(tarefasTable.processoId, id));
  const proximoPrazo = await getProximoPrazo(id);

  res.json({ ...processo, cliente, prazos, tarefas, proximoPrazo });
});

router.put("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { numeroProcesso, tribunal, area, status, observacoes, clienteId, responsavelId } = req.body;

  const [existing] = await db.select().from(processosTable).where(
    and(eq(processosTable.id, id), eq(processosTable.usuarioId, req.userId!))
  ).limit(1);

  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Processo não encontrado" });
    return;
  }

  const [updated] = await db.update(processosTable).set({
    numeroProcesso, tribunal, area, status, observacoes,
    clienteId: clienteId || null,
    responsavelId: responsavelId || null
  }).where(eq(processosTable.id, id)).returning();

  res.json(updated);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  await db.delete(processosTable).where(
    and(eq(processosTable.id, id), eq(processosTable.usuarioId, req.userId!))
  );
  res.status(204).send();
});

export default router;
