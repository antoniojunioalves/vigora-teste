import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clientesTable } from "./clientes";
import { usuariosTable } from "./usuarios";

export const processosTable = pgTable("processos", {
  id: serial("id").primaryKey(),
  numeroProcesso: text("numero_processo").notNull(),
  tribunal: text("tribunal"),
  area: text("area"),
  status: text("status").notNull().default("ativo"),
  observacoes: text("observacoes"),
  clienteId: integer("cliente_id").references(() => clientesTable.id),
  responsavelId: integer("responsavel_id").references(() => usuariosTable.id),
  usuarioId: integer("usuario_id").references(() => usuariosTable.id),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const insertProcessoSchema = createInsertSchema(processosTable).omit({ id: true, criadoEm: true });
export type InsertProcesso = z.infer<typeof insertProcessoSchema>;
export type Processo = typeof processosTable.$inferSelect;
