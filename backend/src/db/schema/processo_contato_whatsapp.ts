import { pgTable, serial, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { processosTable } from "./processos";
import { contatosWhatsappTable } from "./contatos_whatsapp";

export const processoContatoWhatsappTable = pgTable(
  "processo_contato_whatsapp",
  {
    id: serial("id").primaryKey(),
    processoId: integer("processo_id")
      .notNull()
      .references(() => processosTable.id, { onDelete: "cascade" }),
    contatoWhatsappId: integer("contato_whatsapp_id")
      .notNull()
      .references(() => contatosWhatsappTable.id, { onDelete: "cascade" }),
    criadoEm: timestamp("criado_em").notNull().defaultNow(),
  },
  (t) => [unique().on(t.processoId, t.contatoWhatsappId)]
);

export type ProcessoContatoWhatsapp = typeof processoContatoWhatsappTable.$inferSelect;
