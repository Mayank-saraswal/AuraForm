import { relations } from "drizzle-orm/relations";
import { users, accounts, sessions, forms, formThemes, formFields, responses, responseAnswers, payments, subscriptions } from "./schema";

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	forms: many(forms),
	formThemes: many(formThemes),
	payments: many(payments),
	subscriptions: many(subscriptions),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const formsRelations = relations(forms, ({one, many}) => ({
	user: one(users, {
		fields: [forms.userId],
		references: [users.id]
	}),
	formTheme: one(formThemes, {
		fields: [forms.themeId],
		references: [formThemes.id]
	}),
	formFields: many(formFields),
	responses: many(responses),
}));

export const formThemesRelations = relations(formThemes, ({one, many}) => ({
	forms: many(forms),
	user: one(users, {
		fields: [formThemes.createdByUserId],
		references: [users.id]
	}),
}));

export const formFieldsRelations = relations(formFields, ({one, many}) => ({
	form: one(forms, {
		fields: [formFields.formId],
		references: [forms.id]
	}),
	responseAnswers: many(responseAnswers),
}));

export const responsesRelations = relations(responses, ({one, many}) => ({
	form: one(forms, {
		fields: [responses.formId],
		references: [forms.id]
	}),
	responseAnswers: many(responseAnswers),
}));

export const responseAnswersRelations = relations(responseAnswers, ({one}) => ({
	response: one(responses, {
		fields: [responseAnswers.responseId],
		references: [responses.id]
	}),
	formField: one(formFields, {
		fields: [responseAnswers.fieldId],
		references: [formFields.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	user: one(users, {
		fields: [payments.userId],
		references: [users.id]
	}),
	subscription: one(subscriptions, {
		fields: [payments.subscriptionId],
		references: [subscriptions.id]
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one, many}) => ({
	payments: many(payments),
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
}));