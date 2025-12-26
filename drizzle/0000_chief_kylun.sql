CREATE TYPE "public"."analysis_status" AS ENUM('queued', 'running', 'succeeded', 'failed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."evidence_level" AS ENUM('low', 'moderate', 'high');--> statement-breakpoint
CREATE TYPE "public"."scan_source" AS ENUM('camera', 'upload');--> statement-breakpoint
CREATE TYPE "public"."scan_status" AS ENUM('pending', 'uploaded', 'analyzing', 'complete', 'failed');--> statement-breakpoint
CREATE TABLE "analysis_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_id" uuid NOT NULL,
	"status" "analysis_status" DEFAULT 'queued' NOT NULL,
	"model_provider" text,
	"model_name" text,
	"model_version" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "analysis_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analysis_job_id" uuid NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"problems" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"strengths" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"body_comp" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"confidence" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"ip" "inet",
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "peptide_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "peptide_category_map" (
	"peptide_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "peptide_category_map_peptide_id_category_id_pk" PRIMARY KEY("peptide_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "peptides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"short_description" text,
	"evidence" "evidence_level" DEFAULT 'low' NOT NULL,
	"cautions" text,
	"references" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendation_group_items" (
	"group_id" uuid NOT NULL,
	"peptide_id" uuid NOT NULL,
	"guidance" text,
	"notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "recommendation_group_items_group_id_peptide_id_pk" PRIMARY KEY("group_id","peptide_id")
);
--> statement-breakpoint
CREATE TABLE "recommendation_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analysis_job_id" uuid NOT NULL,
	"category_id" uuid,
	"title" text NOT NULL,
	"rationale" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_analyses" (
	"user_id" uuid NOT NULL,
	"analysis_job_id" uuid NOT NULL,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_analyses_user_id_analysis_job_id_pk" PRIMARY KEY("user_id","analysis_job_id")
);
--> statement-breakpoint
CREATE TABLE "scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source" "scan_source" NOT NULL,
	"status" "scan_status" DEFAULT 'pending' NOT NULL,
	"image_object_key" text NOT NULL,
	"image_mime" text,
	"image_bytes" bigint,
	"image_sha256" char(64),
	"captured_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delete_after" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password_hash" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "analysis_jobs" ADD CONSTRAINT "analysis_jobs_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_analysis_job_id_analysis_jobs_id_fk" FOREIGN KEY ("analysis_job_id") REFERENCES "public"."analysis_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peptide_category_map" ADD CONSTRAINT "peptide_category_map_peptide_id_peptides_id_fk" FOREIGN KEY ("peptide_id") REFERENCES "public"."peptides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peptide_category_map" ADD CONSTRAINT "peptide_category_map_category_id_peptide_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."peptide_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_group_items" ADD CONSTRAINT "recommendation_group_items_group_id_recommendation_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."recommendation_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_group_items" ADD CONSTRAINT "recommendation_group_items_peptide_id_peptides_id_fk" FOREIGN KEY ("peptide_id") REFERENCES "public"."peptides"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_groups" ADD CONSTRAINT "recommendation_groups_analysis_job_id_analysis_jobs_id_fk" FOREIGN KEY ("analysis_job_id") REFERENCES "public"."analysis_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_groups" ADD CONSTRAINT "recommendation_groups_category_id_peptide_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."peptide_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_analyses" ADD CONSTRAINT "saved_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_analyses" ADD CONSTRAINT "saved_analyses_analysis_job_id_analysis_jobs_id_fk" FOREIGN KEY ("analysis_job_id") REFERENCES "public"."analysis_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scans" ADD CONSTRAINT "scans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_analysis_jobs_scan_id" ON "analysis_jobs" USING btree ("scan_id");--> statement-breakpoint
CREATE INDEX "idx_analysis_jobs_status" ON "analysis_jobs" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "analysis_results_analysis_job_id_unique" ON "analysis_results" USING btree ("analysis_job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_sessions_refresh_token_hash_unique" ON "auth_sessions" USING btree ("refresh_token_hash");--> statement-breakpoint
CREATE INDEX "idx_auth_sessions_user_id" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_sessions_expires_at" ON "auth_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "peptide_categories_slug_unique" ON "peptide_categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "peptides_name_unique" ON "peptides" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_reco_items_group" ON "recommendation_group_items" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "idx_reco_groups_analysis" ON "recommendation_groups" USING btree ("analysis_job_id");--> statement-breakpoint
CREATE INDEX "idx_saved_analyses_user" ON "saved_analyses" USING btree ("user_id","saved_at");--> statement-breakpoint
CREATE INDEX "idx_scans_user_created" ON "scans" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_scans_status" ON "scans" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");