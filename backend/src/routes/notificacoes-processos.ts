import { Router, type IRouter } from "express";
import {
  db,
  processosTable,
  clientesTable,
  contatosWhatsappTable,
  processoContatoWhatsappTable,
} from "../db/index.js";
import { eq, and } from "drizzle-orm";
import { authMiddleware, AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();
router.use(authMiddleware as any);

router.get("/", async (req: AuthRequest, res) => {
  const processos = await db
    .select()
    .from(processosTable)
    .where(eq(processosTable.usuarioId, req.userId!));

  const result = await Promise.all(
    processos.map(async (processo) => {
      let cliente = null;
      if (processo.clienteId) {
        const [c] = await db
          .select()
          .from(clientesTable)
          .where(eq(clientesTable.id, processo.clienteId))
          .limit(1);
        cliente = c || null;
      }

      const vinculos = await db
        .select()
        .from(processoContatoWhatsappTable)
        .where(eq(processoContatoWhatsappTable.processoId, processo.id));

      const contatos = await Promise.all(
        vinculos.map(async (v) => {
          const [c] = await db
            .select()
            .from(contatosWhatsappTable)
            .where(eq(contatosWhatsappTable.id, v.contatoWhatsappId))
            .limit(1);
          return c || null;
        })
      );

      return {
        ...processo,
        cliente,
        contatos: contatos.filter(Boolean),
        totalContatos: contatos.filter(Boolean).length,
      };
    })
  );

  res.json(result);
});

router.get("/:processoId/contatos", async (req: AuthRequest, res) => {
  const processoId = parseInt(req.params.processoId);

  const [processo] = await db
    .select()
    .from(processosTable)
    .where(
      and(
        eq(processosTable.id, processoId),
        eq(processosTable.usuarioId, req.userId!)
      )
    )
    .limit(1);

  if (!processo) {
    res.status(404).json({ error: "not_found", message: "Processo não encontrado" });
    return;
  }

  const vinculos = await db
    .select()
    .from(processoContatoWhatsappTable)
    .where(eq(processoContatoWhatsappTable.processoId, processoId));

  const contatos = await Promise.all(
    vinculos.map(async (v) => {
      const [c] = await db
        .select()
        .from(contatosWhatsappTable)
        .where(eq(contatosWhatsappTable.id, v.contatoWhatsappId))
        .limit(1);
      return c ? { ...c, vinculoId: v.id } : null;
    })
  );

  res.json(contatos.filter(Boolean));
});

router.post("/:processoId/contatos", async (req: AuthRequest, res) => {
  const processoId = parseInt(req.params.processoId);
  const { contatoIds } = req.body as { contatoIds: number[] };

  if (!Array.isArray(contatoIds)) {
    res.status(400).json({ error: "bad_request", message: "contatoIds deve ser um array" });
    return;
  }

  const [processo] = await db
    .select()
    .from(processosTable)
    .where(
      and(
        eq(processosTable.id, processoId),
        eq(processosTable.usuarioId, req.userId!)
      )
    )
    .limit(1);

  if (!processo) {
    res.status(404).json({ error: "not_found", message: "Processo não encontrado" });
    return;
  }

  const existing = await db
    .select()
    .from(processoContatoWhatsappTable)
    .where(eq(processoContatoWhatsappTable.processoId, processoId));

  const existingIds = new Set(existing.map((v) => v.contatoWhatsappId));

  const toAdd = contatoIds.filter((id) => !existingIds.has(id));
  const toRemove = [...existingIds].filter((id) => !contatoIds.includes(id));

  for (const id of toRemove) {
    await db
      .delete(processoContatoWhatsappTable)
      .where(
        and(
          eq(processoContatoWhatsappTable.processoId, processoId),
          eq(processoContatoWhatsappTable.contatoWhatsappId, id)
        )
      );
  }

  if (toAdd.length > 0) {
    await db.insert(processoContatoWhatsappTable).values(
      toAdd.map((contatoId) => ({ processoId, contatoWhatsappId: contatoId }))
    );
  }

  res.json({ success: true, added: toAdd.length, removed: toRemove.length });
});

router.delete("/:processoId/contatos/:contatoId", async (req: AuthRequest, res) => {
  const processoId = parseInt(req.params.processoId);
  const contatoId = parseInt(req.params.contatoId);

  await db
    .delete(processoContatoWhatsappTable)
    .where(
      and(
        eq(processoContatoWhatsappTable.processoId, processoId),
        eq(processoContatoWhatsappTable.contatoWhatsappId, contatoId)
      )
    );

  res.status(204).send();
});

export default router;
