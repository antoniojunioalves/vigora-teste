import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { roleEnum, statusUsuarioEnum, equipesTable } from "./equipes";

export const usuariosTable = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  telefone: text("telefone"),
  senhaHash: text("senha_hash").notNull(),
  role: roleEnum("role").notNull().default("advogado"),
  status: statusUsuarioEnum("status").notNull().default("ativo"),
  equipeId: integer("equipe_id").references(() => equipesTable.id),
  ultimoAcesso: timestamp("ultimo_acesso"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const insertUsuarioSchema = createInsertSchema(usuariosTable).omit({ id: true, criadoEm: true, ultimoAcesso: true });
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;
export type Usuario = typeof usuariosTable.$inferSelect;
