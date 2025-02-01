import { pgTable, foreignKey, serial, integer, text, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const userSystemEnum = pgEnum("user_system_enum", ['system', 'user'])


export const messages = pgTable("messages", {
	id: serial().primaryKey().notNull(),
	chatId: integer("chat_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	role: userSystemEnum().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.chatId],
			foreignColumns: [chats.id],
			name: "messages_chat_id_chats_id_fk"
		}),
]);

export const chats = pgTable("chats", {
	id: serial().primaryKey().notNull(),
	pdfName: text("pdf_name").notNull(),
	pdfUrl: text("pdf_url").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	userId: varchar("user_id", { length: 256 }).notNull(),
	fileKey: text("file_key").notNull(),
	vectorIds: text().array().default([""]).notNull(),
});
