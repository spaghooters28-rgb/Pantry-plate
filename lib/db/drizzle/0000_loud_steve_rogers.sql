CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"tier" text DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "subscription_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"stripe_event_id" text NOT NULL,
	"user_id" integer,
	"event_type" text NOT NULL,
	"tier" text,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_events_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"user_id" integer NOT NULL,
	"year_month" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "ai_usage_user_id_year_month_pk" PRIMARY KEY("user_id","year_month")
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"meal_id" integer NOT NULL,
	"name" text NOT NULL,
	"quantity" text NOT NULL,
	"unit" text NOT NULL,
	"category" text NOT NULL,
	"is_common_pantry_item" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"cuisine" text NOT NULL,
	"protein" text NOT NULL,
	"is_gluten_free" boolean DEFAULT false NOT NULL,
	"cook_time_minutes" integer NOT NULL,
	"servings" integer DEFAULT 4 NOT NULL,
	"calories" integer NOT NULL,
	"image_url" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"is_favorited" boolean DEFAULT false NOT NULL,
	"instructions" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer
);
--> statement-breakpoint
CREATE TABLE "sides" (
	"id" serial PRIMARY KEY NOT NULL,
	"meal_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_favorites" (
	"user_id" integer NOT NULL,
	"meal_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_favorites_user_id_meal_id_pk" PRIMARY KEY("user_id","meal_id")
);
--> statement-breakpoint
CREATE TABLE "grocery_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"quantity" text NOT NULL,
	"unit" text,
	"category" text NOT NULL,
	"is_checked" boolean DEFAULT false NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL,
	"meal_id" integer,
	"meal_name" text,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pantry_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"quantity" text,
	"category" text NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"last_verified_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"quantity" text NOT NULL,
	"unit" text,
	"category" text NOT NULL,
	"schedule_type" text NOT NULL,
	"schedule_days_interval" integer,
	"next_due_date" date NOT NULL,
	"last_added_date" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_plan_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"day" text NOT NULL,
	"meal_id" integer,
	"selected_side_id" integer
);
--> statement-breakpoint
CREATE TABLE "weekly_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"week_start_date" date NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"cuisine" text DEFAULT 'Other' NOT NULL,
	"protein" text DEFAULT '' NOT NULL,
	"is_gluten_free" boolean DEFAULT false NOT NULL,
	"cook_time_minutes" integer DEFAULT 0 NOT NULL,
	"calories" integer DEFAULT 0 NOT NULL,
	"instructions" text,
	"source_url" text,
	"meal_id" integer,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pinned_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"item_type" text NOT NULL,
	"item_id" integer NOT NULL,
	"pinned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pins_user_type_item" UNIQUE("user_id","item_type","item_id")
);
--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meals" ADD CONSTRAINT "meals_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sides" ADD CONSTRAINT "sides_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grocery_items" ADD CONSTRAINT "grocery_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grocery_items" ADD CONSTRAINT "grocery_items_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pantry_items" ADD CONSTRAINT "pantry_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_items" ADD CONSTRAINT "scheduled_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_plan_days" ADD CONSTRAINT "weekly_plan_days_plan_id_weekly_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."weekly_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_plan_days" ADD CONSTRAINT "weekly_plan_days_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_plans" ADD CONSTRAINT "weekly_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_history" ADD CONSTRAINT "recipe_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pinned_items" ADD CONSTRAINT "pinned_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "preferences_user_key_idx" ON "preferences" USING btree ("key","user_id");