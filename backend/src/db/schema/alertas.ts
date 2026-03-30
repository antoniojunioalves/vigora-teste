import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usuariosTable } from "./usuarios";

export const alertasTable = pgTable("alertas", {
  id: serial("id").primaryKey(),
  tipo: text("tipo").notNull(),
  mensagem: text("mensagem").notNull(),
  referenciaId: integer("referencia_id"),
  referenciaTipo: text("referencia_tipo"),
  lido: boolean("lido").notNull().default(false),
  usuarioId: integer("usuario_id").references(() => usuariosTable.id),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const insertAlertaSchema = createInsertSchema(alertasTable).omit({ id: true, criadoEm: true });
export type InsertAlerta = z.infer<typeof insertAlertaSchema>;
export type Alerta = typeof alertasTable.$inferSelect;
