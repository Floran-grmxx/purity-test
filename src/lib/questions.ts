import type { Category, CategoryAnswers, Question, QuestionGate } from "../data/types";

/** Is a gate met: its gateway is itself visible and answered at/above the threshold? */
function isGateMet(
  gate: QuestionGate,
  byId: Map<string, Question>,
  answers: CategoryAnswers,
): boolean {
  const gateway = byId.get(gate.question);
  if (!gateway) return false;
  if (!isQuestionVisible(gateway, byId, answers)) return false;
  const chosen = answers[gate.question];
  return chosen != null && chosen >= gate.minAnswerIndex;
}

/**
 * Is a single question currently unlocked, given the answers chosen so far?
 * A question with no gate is always visible. A conditional follow-up
 * (`requires`) is visible only when its gateway is visible AND meets the
 * threshold. A logical prerequisite (`onlyIf`) needs at least one of its gates
 * met. Recursion supports chained gates; the integrity test guarantees gateways
 * are declared earlier, so there are no cycles.
 */
export function isQuestionVisible(
  question: Question,
  byId: Map<string, Question>,
  answers: CategoryAnswers,
): boolean {
  if (question.requires && !isGateMet(question.requires, byId, answers)) return false;
  if (question.onlyIf && !question.onlyIf.some((gate) => isGateMet(gate, byId, answers))) {
    return false;
  }
  return true;
}

/** Questions currently shown for a category, kept in declared order. */
export function visibleQuestions(
  category: Category,
  answers: CategoryAnswers = {},
): Question[] {
  const byId = new Map(category.questions.map((q) => [q.id, q]));
  return category.questions.filter((q) => isQuestionVisible(q, byId, answers));
}

/**
 * Indices of the answers still selectable for a question: every limit whose
 * gateway is visible and answered narrows the list. Falls back to every answer
 * if the limits ever leave nothing.
 */
export function allowedAnswerIndices(
  question: Question,
  byId: Map<string, Question>,
  answers: CategoryAnswers,
): number[] {
  let allowed = question.answers.map((_, i) => i);
  for (const limit of question.answerLimits ?? []) {
    const gateway = byId.get(limit.question);
    if (!gateway || !isQuestionVisible(gateway, byId, answers)) continue;
    const chosen = answers[limit.question];
    const subset = chosen == null ? undefined : limit.allowed[chosen];
    if (subset) allowed = allowed.filter((i) => subset.includes(i));
  }
  return allowed.length > 0 ? allowed : question.answers.map((_, i) => i);
}

/**
 * A question whose limits leave a single possible answer is answered
 * automatically and never asked (it would be a pointless click).
 */
export function isAutoAnswered(
  question: Question,
  byId: Map<string, Question>,
  answers: CategoryAnswers,
): boolean {
  return (
    question.answers.length > 1 &&
    allowedAnswerIndices(question, byId, answers).length === 1
  );
}

/**
 * Normalises stored answers: drops answers that a later change made
 * contradictory (e.g. the typical night was raised above the recorded record),
 * so the question is asked again, and fills in auto-answered questions.
 * Answers of hidden questions are kept, in case they get unlocked again.
 */
export function sanitizeAnswers(
  category: Category,
  answers: CategoryAnswers = {},
): CategoryAnswers {
  const byId = new Map(category.questions.map((q) => [q.id, q]));
  const clean: CategoryAnswers = {};
  for (const question of category.questions) {
    const chosen = answers[question.id];
    if (!isQuestionVisible(question, byId, clean)) {
      if (chosen != null) clean[question.id] = chosen;
      continue;
    }
    const allowed = allowedAnswerIndices(question, byId, clean);
    if (isAutoAnswered(question, byId, clean)) clean[question.id] = allowed[0];
    else if (chosen != null && allowed.includes(chosen)) clean[question.id] = chosen;
  }
  return clean;
}

/** Visible questions the player actually has to answer (auto-answered ones skipped). */
export function askedQuestions(
  category: Category,
  answers: CategoryAnswers = {},
): Question[] {
  const byId = new Map(category.questions.map((q) => [q.id, q]));
  return visibleQuestions(category, answers).filter(
    (q) => !isAutoAnswered(q, byId, answers),
  );
}
