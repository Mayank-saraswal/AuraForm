// apps/web/lib/conditional-logic.ts

type AnswerValue = string | number | boolean | string[] | null | undefined;

/** Minimal shape of a form field — only the fields used by conditional logic */
export type FieldWithLogic = {
  logic: unknown;
};

type LogicCondition = {
  fieldId:  string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "is_filled" | "is_empty";
  value?:   string | number | boolean;
};

type FieldLogic = {
  conditions: LogicCondition[];
  logicType:  "all" | "any";
};

/**
 * Evaluates whether a field should be shown given the current answers.
 * Returns true if the field should be VISIBLE.
 */
export function shouldShowField(
  field:   FieldWithLogic,
  answers: Record<string, AnswerValue>
): boolean {
  const logic = field.logic as FieldLogic | null;

  // No logic = always show
  if (!logic || !logic.conditions || logic.conditions.length === 0) return true;

  const results = logic.conditions.map((condition) =>
    evaluateCondition(condition, answers)
  );

  if (logic.logicType === "all") return results.every(Boolean);
  if (logic.logicType === "any") return results.some(Boolean);
  return true;
}

function evaluateCondition(
  condition: LogicCondition,
  answers:   Record<string, AnswerValue>
): boolean {
  const answer = answers[condition.fieldId];

  switch (condition.operator) {
    case "is_filled":
      return answer !== null && answer !== undefined && answer !== "" &&
        !(Array.isArray(answer) && answer.length === 0);

    case "is_empty":
      return answer === null || answer === undefined || answer === "" ||
        (Array.isArray(answer) && answer.length === 0);

    case "equals":
      if (Array.isArray(answer)) return answer.includes(String(condition.value));
      return String(answer) === String(condition.value);

    case "not_equals":
      if (Array.isArray(answer)) return !answer.includes(String(condition.value));
      return String(answer) !== String(condition.value);

    case "contains":
      return String(answer ?? "").toLowerCase().includes(
        String(condition.value ?? "").toLowerCase()
      );

    case "greater_than":
      return Number(answer) > Number(condition.value);

    case "less_than":
      return Number(answer) < Number(condition.value);

    default:
      return true;
  }
}
