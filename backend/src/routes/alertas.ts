import { Router, type IRouter } from "express";
import { db, alertasTable } from "../db/index.js";
import { eq, and } from "drizzle-orm";
import { authMiddleware, AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();
router.use(authMiddleware as any);

router.get("/", async (req: AuthRequest, res) => {
  const { lido } = req.query as { lido?: string };

  let alertas = await db.select().from(alertasTable).where(eq(alertasTable.usuarioId, req.userId!));
  alertas = alertas.sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());

  if (lido !== undefined) {
    const isLido = lido === "true";
    alertas = alertas.filter(a => a.lido === isLido);
  }

  res.json(alertas);
});

router.put("/marcar-todos-lidos", async (req: AuthRequest, res) => {
  await db.update(alertasTable)
    .set({ lido: true })
    .where(and(eq(alertasTable.usuarioId, req.userId!), eq(alertasTable.lido, false)));
  res.json({ success: true });
});

router.put("/:id/lido", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const [existing] = await db.select().from(alertasTable).where(
    and(eq(alertasTable.id, id), eq(alertasTable.usuarioId, req.userId!))
  ).limit(1);

  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Alerta não encontrado" });
    return;
  }

  const [updated] = await db.update(alertasTable)
    .set({ lido: true })
    .where(eq(alertasTable.id, id))
    .returning();

  res.json(updated);
});

export default router;
