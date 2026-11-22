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
