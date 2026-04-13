import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usuariosTable } from "./usuarios";

export const contatosWhatsappTable = pgTable("contatos_whatsapp", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  numeroWhatsapp: text("numero_whatsapp").notNull(),
  email: text("email"),
  status: text("status").notNull().default("ativo"),
  observacoes: text("observacoes"),
  usuarioId: integer("usuario_id").references(() => usuariosTable.id),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

export const insertContatoWhatsappSchema = createInsertSchema(contatosWhatsappTable).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});
export type InsertContatoWhatsapp = z.infer<typeof insertContatoWhatsappSchema>;
export type ContatoWhatsapp = typeof contatosWhatsappTable.$inferSelect;
