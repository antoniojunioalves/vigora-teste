import { pgTable, text, serial, timestamp, integer, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("role", [
  "owner",
  "socio",
  "coordenador",
  "advogado",
  "estagiario",
  "financeiro",
]);

export const statusUsuarioEnum = pgEnum("status_usuario", ["ativo", "inativo"]);

export const equipesTable = pgTable("equipes", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  cor: text("cor").notNull().default("#4f46e5"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const insertEquipeSchema = createInsertSchema(equipesTable).omit({ id: true, criadoEm: true });
export type InsertEquipe = z.infer<typeof insertEquipeSchema>;
export type Equipe = typeof equipesTable.$inferSelect;
