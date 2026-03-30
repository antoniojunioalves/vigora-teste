import { Router, type IRouter } from "express";
import { db, processosTable, prazosTable, tarefasTable, alertasTable, clientesTable } from "../db/index.js";
import { eq, and } from "drizzle-orm";
import { authMiddleware, AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();
router.use(authMiddleware as any);

function calcPrazoStatus(dataLimite: string, currentStatus: string): string {
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

router.get("/stats", async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const processos = await db.select().from(processosTable).where(eq(processosTable.usuarioId, userId));
  const processosAtivos = processos.filter(p => p.status === "ativo").length;
  const processosAtencao = processos.filter(p => p.status === "atencao" || p.status === "prazo_vencido");

  const prazos = await db.select().from(prazosTable).where(eq(prazosTable.usuarioId, userId));
  const prazosComStatus = prazos.map(p => ({ ...p, status: calcPrazoStatus(p.dataLimite, p.status) }));

  const prazosSemana = prazosComStatus.filter(p =>
    p.dataLimite >= todayStr && p.dataLimite <= weekEndStr && p.status !== "concluido"
  ).length;

  const prazosHoje = prazosComStatus.filter(p => p.dataLimite === todayStr && p.status !== "concluido").length;
  const prazosVencidos = prazosComStatus.filter(p => p.status === "vencido").length;

  const total = prazosComStatus.length;
  const concluidos = prazosComStatus.filter(p => p.status === "concluido").length;
  const taxaCumprimento = total > 0 ? Math.round((concluidos / total) * 100) : 100;

  const alertas = await db.select().from(alertasTable).where(
    and(eq(alertasTable.usuarioId, userId), eq(alertasTable.lido, false))
  );
  const alertasCriticos = alertas
    .filter(a => a.tipo === "prazo_vencido" || a.tipo === "prazo_urgente" || a.tipo === "tarefa_atrasada")
    .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime())
    .slice(0, 5);

  const proximosPrazosRaw = prazosComStatus
    .filter(p => p.status !== "concluido" && p.status !== "vencido")
    .sort((a, b) => a.dataLimite.localeCompare(b.dataLimite))
    .slice(0, 8);

  const proximosPrazos = await Promise.all(proximosPrazosRaw.map(async (prazo) => {
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

  const processosAtencaoDetalhes = await Promise.all(
    processosAtencao.slice(0, 5).map(async (processo) => {
      let cliente = null;
      if (processo.clienteId) {
        const [c] = await db.select().from(clientesTable).where(eq(clientesTable.id, processo.clienteId)).limit(1);
        cliente = c || null;
      }
      return { ...processo, cliente, proximoPrazo: null, prazos: [], tarefas: [] };
    })
  );

  res.json({
    processosAtivos,
    prazosSemana,
    prazosHoje,
    prazosVencidos,
    taxaCumprimento,
    alertasCriticos,
    proximosPrazos,
    processosAtencao: processosAtencaoDetalhes,
  });
});

export default router;
