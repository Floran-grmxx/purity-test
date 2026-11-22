import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AnswersByCategory, CategoryId } from "../data/types";
import { loadState, saveState, resetState, type ElapsedByCategory } from "../lib/storage";
import { activeGap } from "../lib/timing";

interface QuizContextValue {
  answers: AnswersByCategory;
  /** active answering time per category, in milliseconds */
  elapsedMs: ElapsedByCategory;
  /** marks "the player is here now" (e.g. a quiz screen opened) without counting time */
  markActivity: () => void;
  setAnswer: (category: CategoryId, questionId: string, answerIndex: number) => void;
  resetCategory: (category: CategoryId) => void;
  resetAll: () => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [initialState] = useState(loadState);
  const [answers, setAnswers] = useState<AnswersByCategory>(initialState.answers);
  const [elapsedMs, setElapsedMs] = useState<ElapsedByCategory>(initialState.elapsedMs);
  // Time of the last player action, kept in memory only: a reload starts fresh.
  const lastActivity = useRef<number | null>(null);

  // Persist on every change (skip the very first render).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    saveState({ answers, elapsedMs });
  }, [answers, elapsedMs]);

  const markActivity = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  const setAnswer = useCallback(
    (category: CategoryId, questionId: string, answerIndex: number) => {
      const now = Date.now();
      const gap = activeGap(lastActivity.current, now);
      lastActivity.current = now;
      setElapsedMs((prev) => ({ ...prev, [category]: (prev[category] ?? 0) + gap }));
      setAnswers((prev) => ({
        ...prev,
        [category]: { ...(prev[category] ?? {}), [questionId]: answerIndex },
      }));
    },
    [],
  );

  const resetCategory = useCallback((category: CategoryId) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
    setElapsedMs((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    resetState();
    setAnswers({});
    setElapsedMs({});
  }, []);

  const value = useMemo<QuizContextValue>(
    () => ({ answers, elapsedMs, markActivity, setAnswer, resetCategory, resetAll }),
    [answers, elapsedMs, markActivity, setAnswer, resetCategory, resetAll],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used within a QuizProvider");
  return ctx;
}
