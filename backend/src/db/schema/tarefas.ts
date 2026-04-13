import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { processosTable } from "./processos";
import { prazosTable } from "./prazos";
import { usuariosTable } from "./usuarios";

export const tarefasTable = pgTable("tarefas", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  processoId: integer("processo_id").references(() => processosTable.id),
  prazoId: integer("prazo_id").references(() => prazosTable.id),
  responsavel: text("responsavel"),
  dataLimite: date("data_limite"),
  status: text("status").notNull().default("pendente"),
  usuarioId: integer("usuario_id").references(() => usuariosTable.id),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const insertTarefaSchema = createInsertSchema(tarefasTable).omit({ id: true, criadoEm: true });
export type InsertTarefa = z.infer<typeof insertTarefaSchema>;
export type Tarefa = typeof tarefasTable.$inferSelect;
