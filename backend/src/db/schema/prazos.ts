import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { processosTable } from "./processos";
import { usuariosTable } from "./usuarios";

export const prazosTable = pgTable("prazos", {
  id: serial("id").primaryKey(),
  processoId: integer("processo_id").references(() => processosTable.id),
  tipo: text("tipo").notNull(),
  descricao: text("descricao"),
  dataLimite: date("data_limite").notNull(),
  responsavel: text("responsavel"),
  prioridade: text("prioridade").notNull().default("media"),
  status: text("status").notNull().default("ok"),
  usuarioId: integer("usuario_id").references(() => usuariosTable.id),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const insertPrazoSchema = createInsertSchema(prazosTable).omit({ id: true, criadoEm: true });
export type InsertPrazo = z.infer<typeof insertPrazoSchema>;
export type Prazo = typeof prazosTable.$inferSelect;
