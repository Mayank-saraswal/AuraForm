import { pgTable, text, timestamp, foreignKey, uuid, unique, uniqueIndex, index, varchar, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const fieldType = pgEnum("field_type", ['short_text', 'long_text', 'email', 'number', 'phone', 'url', 'single_select', 'multi_select', 'dropdown', 'checkbox', 'rating', 'scale', 'date', 'time', 'yes_no', 'file_upload', 'statement', 'welcome_screen', 'thank_you_screen'])
export const formStatus = pgEnum("form_status", ['draft', 'published', 'archived', 'closed'])
export const formVisibility = pgEnum("form_visibility", ['public', 'unlisted'])
export const plan = pgEnum("plan", ['free', 'pro', 'team'])
export const subscriptionStatus = pgEnum("subscription_status", ['active', 'cancelled', 'expired', 'past_due', 'trialing'])


export const verifications = pgTable("verifications", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
});

export const accounts = pgTable("accounts", {
	id: text().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	idToken: text("id_token"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const sessions = pgTable("sessions", {
	id: text().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("sessions_token_unique").on(table.token),
]);

export const forms = pgTable("forms", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	themeId: uuid("theme_id"),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	slug: varchar({ length: 80 }),
	status: formStatus().default('draft').notNull(),
	visibility: formVisibility().default('unlisted').notNull(),
	responseLimit: integer("response_limit"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	passwordHash: text("password_hash"),
	notifyOnResponse: boolean("notify_on_response").default(true).notNull(),
	notifyEmail: varchar("notify_email", { length: 255 }),
	thankYouTitle: varchar("thank_you_title", { length: 200 }),
	thankYouMessage: text("thank_you_message"),
	redirectUrl: text("redirect_url"),
	showBranding: boolean("show_branding").default(true).notNull(),
	viewCount: integer("view_count").default(0).notNull(),
	responseCount: integer("response_count").default(0).notNull(),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	archivedAt: timestamp("archived_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("forms_slug_unique_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("forms_status_visibility_idx").using("btree", table.status.asc().nullsLast().op("enum_ops"), table.visibility.asc().nullsLast().op("enum_ops")),
	index("forms_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "forms_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.themeId],
			foreignColumns: [formThemes.id],
			name: "forms_theme_id_form_themes_id_fk"
		}).onDelete("set null"),
	unique("forms_slug_unique").on(table.slug),
]);

export const formFields = pgTable("form_fields", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	formId: uuid("form_id").notNull(),
	type: fieldType().notNull(),
	label: varchar({ length: 500 }).notNull(),
	description: text(),
	placeholder: varchar({ length: 300 }),
	required: boolean().default(false).notNull(),
	order: integer().notNull(),
	options: jsonb(),
	validation: jsonb(),
	logic: jsonb(),
	buttonLabel: varchar("button_label", { length: 100 }),
	imageUrl: text("image_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	index("form_fields_form_id_idx").using("btree", table.formId.asc().nullsLast().op("uuid_ops")),
	index("form_fields_form_id_order_idx").using("btree", table.formId.asc().nullsLast().op("int4_ops"), table.order.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.formId],
			foreignColumns: [forms.id],
			name: "form_fields_form_id_forms_id_fk"
		}).onDelete("cascade"),
]);

export const formThemes = pgTable("form_themes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	category: varchar({ length: 50 }).notNull(),
	config: jsonb().notNull(),
	previewImageUrl: text("preview_image_url"),
	isPro: boolean("is_pro").default(false).notNull(),
	isCustom: boolean("is_custom").default(false).notNull(),
	createdByUserId: uuid("created_by_user_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdByUserId],
			foreignColumns: [users.id],
			name: "form_themes_created_by_user_id_users_id_fk"
		}).onDelete("set null"),
	unique("form_themes_slug_unique").on(table.slug),
]);

export const responses = pgTable("responses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	formId: uuid("form_id").notNull(),
	ipHash: text("ip_hash"),
	userAgent: text("user_agent"),
	timeToCompleteMs: integer("time_to_complete_ms"),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("responses_form_id_idx").using("btree", table.formId.asc().nullsLast().op("uuid_ops")),
	index("responses_submitted_at_idx").using("btree", table.submittedAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.formId],
			foreignColumns: [forms.id],
			name: "responses_form_id_forms_id_fk"
		}).onDelete("cascade"),
]);

export const responseAnswers = pgTable("response_answers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	responseId: uuid("response_id").notNull(),
	fieldId: uuid("field_id").notNull(),
	value: jsonb().notNull(),
}, (table) => [
	index("response_answers_field_id_idx").using("btree", table.fieldId.asc().nullsLast().op("uuid_ops")),
	index("response_answers_response_id_idx").using("btree", table.responseId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.responseId],
			foreignColumns: [responses.id],
			name: "response_answers_response_id_responses_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.fieldId],
			foreignColumns: [formFields.id],
			name: "response_answers_field_id_form_fields_id_fk"
		}).onDelete("cascade"),
]);

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	subscriptionId: uuid("subscription_id"),
	razorpayOrderId: text("razorpay_order_id").notNull(),
	razorpayPaymentId: text("razorpay_payment_id"),
	razorpaySignature: text("razorpay_signature"),
	amountPaise: integer("amount_paise").notNull(),
	currency: varchar({ length: 3 }).default('INR').notNull(),
	status: varchar({ length: 20 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("payments_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "payments_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.subscriptionId],
			foreignColumns: [subscriptions.id],
			name: "payments_subscription_id_subscriptions_id_fk"
		}),
	unique("payments_razorpay_order_id_unique").on(table.razorpayOrderId),
	unique("payments_razorpay_payment_id_unique").on(table.razorpayPaymentId),
]);

export const subscriptions = pgTable("subscriptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	razorpaySubscriptionId: text("razorpay_subscription_id"),
	razorpayCustomerId: text("razorpay_customer_id"),
	plan: varchar({ length: 20 }).notNull(),
	billingCycle: varchar("billing_cycle", { length: 10 }).notNull(),
	status: subscriptionStatus().default('active').notNull(),
	currentPeriodStart: timestamp("current_period_start", { mode: 'string' }).notNull(),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }).notNull(),
	cancelledAt: timestamp("cancelled_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	index("subscriptions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "subscriptions_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("subscriptions_razorpay_subscription_id_unique").on(table.razorpaySubscriptionId),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fullName: varchar("full_name", { length: 80 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	profileImageUrl: text("profile_image_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	passwordHash: text("password_hash"),
	plan: plan().default('free').notNull(),
	password: text(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);
