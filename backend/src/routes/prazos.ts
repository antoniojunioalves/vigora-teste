import { Router, type IRouter } from "express";
import { db, prazosTable, processosTable, alertasTable } from "../db/index.js";
import { eq, and, lte, gte } from "drizzle-orm";
import { authMiddleware, AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();
router.use(authMiddleware as any);

function calcStatus(dataLimite: string, currentStatus: string): string {
  if (currentStatus === "concluido") return "concluido";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limite = new Date(dataLimite + "T00:00:00");
  const diff = Math.floor((limite.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "vencido";
  if (diff <= 2) return "urgente";
  if (diff <= 7) return "atencao";
  return "ok";
}

router.get("/", async (req: AuthRequest, res) => {
  const { status, processoId, responsavel, periodo } = req.query as {
    status?: string;
    processoId?: string;
    responsavel?: string;
    periodo?: string;
  };

  let prazos = await db.select().from(prazosTable).where(eq(prazosTable.usuarioId, req.userId!));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (periodo === "hoje") {
    const todayStr = today.toISOString().split("T")[0];
    prazos = prazos.filter(p => p.dataLimite === todayStr);
  } else if (periodo === "proximos3") {
    const limit = new Date(today);
    limit.setDate(limit.getDate() + 3);
    prazos = prazos.filter(p => p.dataLimite >= today.toISOString().split("T")[0] && p.dataLimite <= limit.toISOString().split("T")[0]);
  } else if (periodo === "proximos7") {
    const limit = new Date(today);
    limit.setDate(limit.getDate() + 7);
    prazos = prazos.filter(p => p.dataLimite >= today.toISOString().split("T")[0] && p.dataLimite <= limit.toISOString().split("T")[0]);
  } else if (periodo === "vencidos") {
    prazos = prazos.filter(p => p.dataLimite < today.toISOString().split("T")[0] && p.status !== "concluido");
  }

  if (processoId) {
    prazos = prazos.filter(p => p.processoId === parseInt(processoId));
  }
  if (responsavel) {
    prazos = prazos.filter(p => p.responsavel?.toLowerCase().includes(responsavel.toLowerCase()));
  }

  const prazosComStatus = prazos.map(p => ({
    ...p,
    status: calcStatus(p.dataLimite, p.status),
  }));

  if (status) {
    const filtered = prazosComStatus.filter(p => p.status === status);
    const result = await Promise.all(filtered.map(async (prazo) => {
      let processo = null;
      if (prazo.processoId) {
        const [proc] = await db.select({
          id: processosTable.id,
          numeroProcesso: processosTable.numeroProcesso,
          area: processosTable.area,
          status: processosTable.status,
        }).from(processosTable).where(eq(processosTable.id, prazo.processoId)).limit(1);
        processo = proc || null;
      }
      return { ...prazo, processo };
    }));
    res.json(result);
    return;
  }

  const result = await Promise.all(prazosComStatus.map(async (prazo) => {
    let processo = null;
    if (prazo.processoId) {
      const [proc] = await db.select({
        id: processosTable.id,
        numeroProcesso: processosTable.numeroProcesso,
        area: processosTable.area,
        status: processosTable.status,
      }).from(processosTable).where(eq(processosTable.id, prazo.processoId)).limit(1);
      processo = proc || null;
    }
    return { ...prazo, processo };
  }));

  res.json(result);
});

router.post("/", async (req: AuthRequest, res) => {
  const { processoId, tipo, descricao, dataLimite, responsavel, prioridade, status } = req.body;

  if (!tipo || !dataLimite || !prioridade || !status) {
    res.status(400).json({ error: "bad_request", message: "Tipo, data limite, prioridade e status são obrigatórios" });
    return;
  }

  const [prazo] = await db.insert(prazosTable).values({
    processoId: processoId || null,
    tipo, descricao, dataLimite, responsavel, prioridade, status,
    usuarioId: req.userId!
  }).returning();

  await db.insert(alertasTable).values({
    tipo: "prazo_criado",
    mensagem: `Novo prazo cadastrado: ${tipo} para ${dataLimite}`,
    referenciaId: prazo.id,
    referenciaTipo: "prazo",
    lido: false,
    usuarioId: req.userId!
  });

  res.status(201).json(prazo);
});

router.get("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const [prazo] = await db.select().from(prazosTable).where(
    and(eq(prazosTable.id, id), eq(prazosTable.usuarioId, req.userId!))
  ).limit(1);

  if (!prazo) {
    res.status(404).json({ error: "not_found", message: "Prazo não encontrado" });
    return;
  }

  let processo = null;
  if (prazo.processoId) {
    const [proc] = await db.select({
      id: processosTable.id,
      numeroProcesso: processosTable.numeroProcesso,
      area: processosTable.area,
      status: processosTable.status,
    }).from(processosTable).where(eq(processosTable.id, prazo.processoId)).limit(1);
    processo = proc || null;
  }

  res.json({ ...prazo, status: calcStatus(prazo.dataLimite, prazo.status), processo });
});

router.put("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { processoId, tipo, descricao, dataLimite, responsavel, prioridade, status } = req.body;

  const [existing] = await db.select().from(prazosTable).where(
    and(eq(prazosTable.id, id), eq(prazosTable.usuarioId, req.userId!))
  ).limit(1);

  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Prazo não encontrado" });
    return;
  }

  const [updated] = await db.update(prazosTable).set({
    processoId: processoId || null,
    tipo, descricao, dataLimite, responsavel, prioridade, status
  }).where(eq(prazosTable.id, id)).returning();

  res.json({ ...updated, status: calcStatus(updated.dataLimite, updated.status) });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  await db.delete(prazosTable).where(
    and(eq(prazosTable.id, id), eq(prazosTable.usuarioId, req.userId!))
  );
  res.status(204).send();
});

export default router;
