export type CategoryId = "sexe" | "drogue" | "alcool" | "moral" | "hygiene";

export interface Answer {
  label: string;
  /** >= 0 ; 0 = innocent, plus haut = plus expérimenté / trash */
  points: number;
  /**
   * "Not concerned" answer: the question is left out of the score entirely
   * (neither earned nor max points), so it neither helps nor hurts.
   */
  notApplicable?: boolean;
}

/**
 * Gate that conditionally unlocks a follow-up question. The follow-up is shown
 * (and scored) only when the gateway question has been answered with an option
 * whose index is >= minAnswerIndex. The gateway must be declared earlier in the
 * same category so visibility can be resolved without cycles.
 */
export interface QuestionGate {
  /** id of the gateway question in the same category */
  question: string;
  /** show the follow-up when the chosen answer index is >= this threshold */
  minAnswerIndex: number;
}

/**
 * Restricts which answers of a question stay selectable, depending on what was
 * answered to an earlier question (e.g. the record night can't be smaller than
 * a typical night). Gateway answers missing from `allowed` leave every option.
 */
export interface AnswerLimit {
  /** id of an earlier question in the same category */
  question: string;
  /** gateway answer index -> indices of this question's answers still allowed */
  allowed: Record<number, number[]>;
}

export interface Question {
  id: string;
  text: string;
  answers: Answer[];
  /** when set, the question is a conditional follow-up gated by another answer */
  requires?: QuestionGate;
  /**
   * Logical prerequisite: the question only makes sense when at least one of
   * these gates is met (e.g. no alcohol questions for someone who never drank).
   * Unlike `requires`, it hides a regular question rather than unlocking a
   * follow-up. Gateways must be declared earlier in the same category.
   */
  onlyIf?: QuestionGate[];
  /** hides answers that would contradict an earlier answer */
  answerLimits?: AnswerLimit[];
}

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  /** hex accent color */
  color: string;
  questions: Question[];
}

/** questionId -> index of the selected answer */
export type CategoryAnswers = Record<string, number>;

/** answers grouped by category, as persisted */
export type AnswersByCategory = Partial<Record<CategoryId, CategoryAnswers>>;
