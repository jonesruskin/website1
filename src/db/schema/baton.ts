import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

/**
 * Baton: the recommendation network for success moments.
 *
 * A tool declares what its users bring (`inputs`) and what they leave with
 * (`outputs`). When a host tool calls `baton.pass()`, the network shows ONE
 * card for a tool whose inputs match the host's outputs. Clicks move credits:
 * the host earns 1, the shown tool spends 1. `credits` is a cached balance;
 * `baton_ledger` is the audit trail it is derived from.
 */
export const batonTool = pgTable(
  "baton_tool",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    url: text("url").notNull(),
    description: text("description").notNull().default(""),
    category: text("category").notNull(),
    inputs: text("inputs").array().notNull().default([]),
    outputs: text("outputs").array().notNull().default([]),
    /** Card copy shown in other tools' success moments. */
    cardTitle: text("card_title").notNull(),
    cardBody: text("card_body").notNull().default(""),
    cardCta: text("card_cta").notNull().default("Open"),
    /** Public key used by the embed. Not a secret: it identifies the host tool. */
    siteKey: text("site_key").notNull().unique(),
    status: text("status").notNull().default("active"),
    /** Opt in to being paired with tools in the same category (off: no competitors). */
    allowSameCategory: boolean("allow_same_category").notNull().default(false),
    credits: integer("credits").notNull().default(0),
    /** First time the embed rendered on the host site: proves the install. */
    installedAt: timestamp("installed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("baton_tool_user_idx").on(table.userId)],
);

export const batonImpression = pgTable(
  "baton_impression",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    hostToolId: uuid("host_tool_id")
      .notNull()
      .references(() => batonTool.id, { onDelete: "cascade" }),
    shownToolId: uuid("shown_tool_id")
      .notNull()
      .references(() => batonTool.id, { onDelete: "cascade" }),
    ctx: text("ctx"),
    /** Daily-rotating hash of IP + user agent. Never the raw values. */
    visitorHash: text("visitor_hash").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("baton_impression_host_idx").on(table.hostToolId, table.createdAt),
    index("baton_impression_shown_idx").on(table.shownToolId, table.createdAt),
  ],
);

export const batonClick = pgTable(
  "baton_click",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** One click per impression, enforced by the database. */
    impressionId: uuid("impression_id")
      .notNull()
      .unique()
      .references(() => batonImpression.id, { onDelete: "cascade" }),
    hostToolId: uuid("host_tool_id")
      .notNull()
      .references(() => batonTool.id, { onDelete: "cascade" }),
    shownToolId: uuid("shown_tool_id")
      .notNull()
      .references(() => batonTool.id, { onDelete: "cascade" }),
    visitorHash: text("visitor_hash").notNull(),
    /** False when the click was valid for the visitor but not for credits (duplicate, fraud rules). */
    credited: boolean("credited").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("baton_click_host_idx").on(table.hostToolId, table.createdAt),
    index("baton_click_shown_idx").on(table.shownToolId, table.createdAt),
    index("baton_click_visitor_idx").on(table.visitorHash, table.shownToolId),
  ],
);

export const batonLedger = pgTable(
  "baton_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    toolId: uuid("tool_id")
      .notNull()
      .references(() => batonTool.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    /** starter | click_sent | click_received | bonus | adjustment */
    reason: text("reason").notNull(),
    clickId: uuid("click_id").references(() => batonClick.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("baton_ledger_tool_idx").on(table.toolId, table.createdAt)],
);

/** A direct pairing between two tools (paid plans). Accepted handshakes rank first. */
export const batonHandshake = pgTable(
  "baton_handshake",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromToolId: uuid("from_tool_id")
      .notNull()
      .references(() => batonTool.id, { onDelete: "cascade" }),
    toToolId: uuid("to_tool_id")
      .notNull()
      .references(() => batonTool.id, { onDelete: "cascade" }),
    /** pending | accepted | declined */
    status: text("status").notNull().default("pending"),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    respondedAt: timestamp("responded_at"),
  },
  (table) => [uniqueIndex("baton_handshake_pair_idx").on(table.fromToolId, table.toToolId)],
);

/** Tools or whole categories a host never wants to show. */
export const batonBlock = pgTable(
  "baton_block",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    toolId: uuid("tool_id")
      .notNull()
      .references(() => batonTool.id, { onDelete: "cascade" }),
    blockedToolId: uuid("blocked_tool_id").references(() => batonTool.id, {
      onDelete: "cascade",
    }),
    blockedCategory: text("blocked_category"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("baton_block_tool_idx").on(table.toolId)],
);

export type BatonTool = typeof batonTool.$inferSelect;
export type BatonImpression = typeof batonImpression.$inferSelect;
export type BatonClick = typeof batonClick.$inferSelect;
export type BatonLedgerEntry = typeof batonLedger.$inferSelect;
export type BatonHandshake = typeof batonHandshake.$inferSelect;
export type BatonBlock = typeof batonBlock.$inferSelect;
