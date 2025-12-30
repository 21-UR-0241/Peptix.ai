import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  bigint,
  jsonb,
  numeric,
  inet,
  char,
  primaryKey,
  uniqueIndex,
  index,
  serial
} from "drizzle-orm/pg-core";

// ---------------- ENUMS ----------------
export const scanSourceEnum = pgEnum("scan_source", ["camera", "upload"]);

export const scanStatusEnum = pgEnum("scan_status", [
  "pending",
  "uploaded",
  "analyzing",
  "complete",
  "failed",
]);

export const analysisStatusEnum = pgEnum("analysis_status", [
  "queued",
  "running",
  "succeeded",
  "failed",
  "canceled",
]);

export const evidenceLevelEnum = pgEnum("evidence_level", ["low", "moderate", "high"]);

// ---------------- USERS ----------------
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    email: text("email").notNull(),
    name: text("name"),
    passwordHash: text("password_hash").notNull(),
     profilePicture: text("profile_picture"), // 🆕 Add this line
    emailVerified: boolean("email_verified").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (t) => ({
    emailUq: uniqueIndex("users_email_unique").on(t.email),
    emailIdx: index("idx_users_email").on(t.email),
  })
);

// ---------------- AUTH SESSIONS ----------------
export const authSessions = pgTable(
  "auth_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    refreshTokenHash: text("refresh_token_hash").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),

    ip: inet("ip"),
    userAgent: text("user_agent"),
  },
  (t) => ({
    refreshTokenUq: uniqueIndex("auth_sessions_refresh_token_hash_unique").on(t.refreshTokenHash),
    userIdx: index("idx_auth_sessions_user_id").on(t.userId),
    expiresIdx: index("idx_auth_sessions_expires_at").on(t.expiresAt),
  })
);

// ---------------- SCANS ----------------
export const scans = pgTable(
  "scans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    source: scanSourceEnum("source").notNull(),
    status: scanStatusEnum("status").notNull().default("pending"),

    // Store key/path to object storage (S3/R2/etc.)
    imageObjectKey: text("image_object_key").notNull(),
    imageMime: text("image_mime"),
    imageBytes: bigint("image_bytes", { mode: "number" }),

    imageSha256: char("image_sha256", { length: 64 }),

    capturedAt: timestamp("captured_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

    // optional retention control
    deleteAfter: timestamp("delete_after", { withTimezone: true }),
  },
  (t) => ({
    userCreatedIdx: index("idx_scans_user_created").on(t.userId, t.createdAt),
    statusIdx: index("idx_scans_status").on(t.status),
  })
);

// ---------------- ANALYSIS JOBS ----------------
export const analysisJobs = pgTable(
  "analysis_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scanId: uuid("scan_id")
      .notNull()
      .references(() => scans.id, { onDelete: "cascade" }),

    status: analysisStatusEnum("status").notNull().default("queued"),

    modelProvider: text("model_provider"),
    modelName: text("model_name"),
    modelVersion: text("model_version"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    errorMessage: text("error_message"),
  },
  (t) => ({
    scanIdx: index("idx_analysis_jobs_scan_id").on(t.scanId),
    statusIdx: index("idx_analysis_jobs_status").on(t.status),
  })
);

// ---------------- ANALYSIS RESULTS ----------------
export const analysisResults = pgTable(
  "analysis_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    analysisJobId: uuid("analysis_job_id")
      .notNull()
      .references(() => analysisJobs.id, { onDelete: "cascade" }),

    summary: jsonb("summary").notNull().default({}),
    problems: jsonb("problems").notNull().default([]),
    strengths: jsonb("strengths").notNull().default([]),
    bodyComp: jsonb("body_comp").notNull().default({}),

    confidence: numeric("confidence", { precision: 5, scale: 2 }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    analysisJobUq: uniqueIndex("analysis_results_analysis_job_id_unique").on(t.analysisJobId),
    // Optional: GIN indexes can be added via raw SQL migration if desired
  })
);

// ---------------- PEPTIDE CATALOG ----------------
export const peptideCategories = pgTable(
  "peptide_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => ({
    slugUq: uniqueIndex("peptide_categories_slug_unique").on(t.slug),
  })
);

export const peptides = pgTable(
  "peptides",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    shortDescription: text("short_description"),
    evidence: evidenceLevelEnum("evidence").notNull().default("low"),

    cautions: text("cautions"),
    references: jsonb("references").notNull().default([]),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    nameUq: uniqueIndex("peptides_name_unique").on(t.name),
  })
);

export const peptideCategoryMap = pgTable(
  "peptide_category_map",
  {
    peptideId: uuid("peptide_id")
      .notNull()
      .references(() => peptides.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => peptideCategories.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.peptideId, t.categoryId] }),
  })
);

// ---------------- RECOMMENDATION GROUPS ----------------
export const recommendationGroups = pgTable(
  "recommendation_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    analysisJobId: uuid("analysis_job_id")
      .notNull()
      .references(() => analysisJobs.id, { onDelete: "cascade" }),

    categoryId: uuid("category_id").references(() => peptideCategories.id, {
      onDelete: "set null",
    }),

    title: text("title").notNull(),
    rationale: text("rationale"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => ({
    analysisIdx: index("idx_reco_groups_analysis").on(t.analysisJobId),
  })
);

export const recommendationGroupItems = pgTable(
  "recommendation_group_items",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => recommendationGroups.id, { onDelete: "cascade" }),
    peptideId: uuid("peptide_id")
      .notNull()
      .references(() => peptides.id, { onDelete: "restrict" }),

    guidance: text("guidance"),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.groupId, t.peptideId] }),
    groupIdx: index("idx_reco_items_group").on(t.groupId),
  })
);

// ---------------- USER SAVED ANALYSES ----------------
export const savedAnalyses = pgTable(
  "saved_analyses",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    analysisJobId: uuid("analysis_job_id")
      .notNull()
      .references(() => analysisJobs.id, { onDelete: "cascade" }),
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.analysisJobId] }),
    userSavedIdx: index("idx_saved_analyses_user").on(t.userId, t.savedAt),
  })
);


export const analysisHistory = pgTable("analysis_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productName: text("product_name"),
  analysis: text("analysis").notNull(),
  imageUrl: text("image_url"),
  healthScore: integer("health_score"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});