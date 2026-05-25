import { relations } from "drizzle-orm";
import { usersTable } from "./models/user";
import { formsTable, formFieldsTable, formThemesTable } from "./models/form";
import { responsesTable, responseAnswersTable } from "./models/response";
import { subscriptionsTable, paymentsTable } from "./models/subscription";

export const usersRelations = relations(usersTable, ({ many }) => ({
  forms: many(formsTable),
}));

export const formsRelations = relations(formsTable, ({ one, many }) => ({
  user: one(usersTable, { fields: [formsTable.userId], references: [usersTable.id] }),
  theme: one(formThemesTable, { fields: [formsTable.themeId], references: [formThemesTable.id] }),
  fields: many(formFieldsTable),
  responses: many(responsesTable),
}));

export const formFieldsRelations = relations(formFieldsTable, ({ one, many }) => ({
  form: one(formsTable, { fields: [formFieldsTable.formId], references: [formsTable.id] }),
  answers: many(responseAnswersTable),
}));

export const formThemesRelations = relations(formThemesTable, ({ one, many }) => ({
  creator: one(usersTable, { fields: [formThemesTable.createdByUserId], references: [usersTable.id] }),
  forms: many(formsTable),
}));

export const responsesRelations = relations(responsesTable, ({ one, many }) => ({
  form: one(formsTable, { fields: [responsesTable.formId], references: [formsTable.id] }),
  answers: many(responseAnswersTable),
}));

export const responseAnswersRelations = relations(responseAnswersTable, ({ one }) => ({
  response: one(responsesTable, { fields: [responseAnswersTable.responseId], references: [responsesTable.id] }),
  field: one(formFieldsTable, { fields: [responseAnswersTable.fieldId], references: [formFieldsTable.id] }),
}));

export const subscriptionsRelations = relations(subscriptionsTable, ({ one }) => ({
  user: one(usersTable, { fields: [subscriptionsTable.userId], references: [usersTable.id] }),
}));

export const paymentsRelations = relations(paymentsTable, ({ one }) => ({
  user: one(usersTable, { fields: [paymentsTable.userId], references: [usersTable.id] }),
}));

export * from "./models/user";
export * from "./models/form";
export * from "./models/response";
export * from "./models/subscription";
