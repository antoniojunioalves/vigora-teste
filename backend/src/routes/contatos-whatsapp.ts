import { Router, type IRouter } from "express";
import { db, contatosWhatsappTable } from "../db/index.js";
import { eq, and, ilike, or } from "drizzle-orm";
import { authMiddleware, AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();
router.use(authMiddleware as any);

router.get("/", async (req: AuthRequest, res) => {
  const { search, status } = req.query as { search?: string; status?: string };

  let contatos = await db
    .select()
    .from(contatosWhatsappTable)
    .where(eq(contatosWhatsappTable.usuarioId, req.userId!));

  if (search) {
    const s = search.toLowerCase();
    contatos = contatos.filter(
      (c) =>
        c.nome.toLowerCase().includes(s) ||
        c.numeroWhatsapp.includes(s) ||
        (c.email?.toLowerCase().includes(s) ?? false)
    );
  }

  if (status && status !== "todos") {
    contatos = contatos.filter((c) => c.status === status);
  }

  res.json(contatos);
});

router.post("/", async (req: AuthRequest, res) => {
  const { nome, numeroWhatsapp, email, status, observacoes } = req.body;

  if (!nome || !nome.trim()) {
    res.status(400).json({ error: "bad_request", message: "Nome é obrigatório" });
    return;
  }
  if (!numeroWhatsapp || !numeroWhatsapp.trim()) {
    res.status(400).json({ error: "bad_request", message: "Número de WhatsApp é obrigatório" });
    return;
  }

  const digits = numeroWhatsapp.replace(/\D/g, "");
  if (digits.length < 10) {
    res.status(400).json({ error: "bad_request", message: "Número deve ter pelo menos 10 dígitos" });
    return;
  }

  const existing = await db
    .select()
    .from(contatosWhatsappTable)
    .where(
      and(
        eq(contatosWhatsappTable.usuarioId, req.userId!),
        eq(contatosWhatsappTable.numeroWhatsapp, numeroWhatsapp.trim())
      )
    )
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "conflict", message: "Já existe um contato com esse número de WhatsApp" });
    return;
  }

  const [contato] = await db
    .insert(contatosWhatsappTable)
    .values({
      nome: nome.trim(),
      numeroWhatsapp: numeroWhatsapp.trim(),
      email: email?.trim() || null,
      status: status || "ativo",
      observacoes: observacoes?.trim() || null,
      usuarioId: req.userId!,
    })
    .returning();

  res.status(201).json(contato);
});

router.get("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const [contato] = await db
    .select()
    .from(contatosWhatsappTable)
    .where(
      and(
        eq(contatosWhatsappTable.id, id),
        eq(contatosWhatsappTable.usuarioId, req.userId!)
      )
    )
    .limit(1);

  if (!contato) {
    res.status(404).json({ error: "not_found", message: "Contato não encontrado" });
    return;
  }

  res.json(contato);
});

router.put("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { nome, numeroWhatsapp, email, status, observacoes } = req.body;

  const [existing] = await db
    .select()
    .from(contatosWhatsappTable)
    .where(
      and(
        eq(contatosWhatsappTable.id, id),
        eq(contatosWhatsappTable.usuarioId, req.userId!)
      )
    )
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Contato não encontrado" });
    return;
  }

  if (numeroWhatsapp && numeroWhatsapp !== existing.numeroWhatsapp) {
    const dup = await db
      .select()
      .from(contatosWhatsappTable)
      .where(
        and(
          eq(contatosWhatsappTable.usuarioId, req.userId!),
          eq(contatosWhatsappTable.numeroWhatsapp, numeroWhatsapp.trim())
        )
      )
      .limit(1);
    if (dup.length > 0) {
      res.status(409).json({ error: "conflict", message: "Já existe um contato com esse número" });
      return;
    }
  }

  const [updated] = await db
    .update(contatosWhatsappTable)
    .set({
      nome: nome?.trim() ?? existing.nome,
      numeroWhatsapp: numeroWhatsapp?.trim() ?? existing.numeroWhatsapp,
      email: email !== undefined ? (email?.trim() || null) : existing.email,
      status: status ?? existing.status,
      observacoes: observacoes !== undefined ? (observacoes?.trim() || null) : existing.observacoes,
      atualizadoEm: new Date(),
    })
    .where(eq(contatosWhatsappTable.id, id))
    .returning();

  res.json(updated);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  await db
    .delete(contatosWhatsappTable)
    .where(
      and(
        eq(contatosWhatsappTable.id, id),
        eq(contatosWhatsappTable.usuarioId, req.userId!)
      )
    );
  res.status(204).send();
});

export default router;
