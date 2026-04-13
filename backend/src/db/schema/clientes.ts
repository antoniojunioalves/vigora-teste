import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usuariosTable } from "./usuarios";

export const clientesTable = pgTable("clientes", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  cpfCnpj: text("cpf_cnpj"),
  telefone: text("telefone"),
  email: text("email"),
  observacoes: text("observacoes"),
  usuarioId: integer("usuario_id").references(() => usuariosTable.id),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const insertClienteSchema = createInsertSchema(clientesTable).omit({ id: true, criadoEm: true });
export type InsertCliente = z.infer<typeof insertClienteSchema>;
export type Cliente = typeof clientesTable.$inferSelect;
