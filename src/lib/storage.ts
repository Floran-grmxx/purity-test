import type { AnswersByCategory, CategoryId } from "../data/types";

const KEY = "purity-test:v1";

/** active answering time per category, in milliseconds */
export type ElapsedByCategory = Partial<Record<CategoryId, number>>;

export interface StoredState {
  answers: AnswersByCategory;
  elapsedMs: ElapsedByCategory;
}

const EMPTY_STATE: StoredState = { answers: {}, elapsedMs: {} };

/** Keeps only finite, non-negative durations (older saves have none). */
function readElapsed(value: unknown): ElapsedByCategory {
  if (!isPlainObject(value)) return {};
  const elapsed: ElapsedByCategory = {};
  for (const [id, ms] of Object.entries(value)) {
    if (typeof ms === "number" && Number.isFinite(ms) && ms >= 0) {
      elapsed[id as CategoryId] = ms;
    }
  }
  return elapsed;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Load persisted state, tolerant to missing / corrupted data. */
export function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (!isPlainObject(parsed) || !isPlainObject(parsed.answers)) {
      return EMPTY_STATE;
    }
    return {
      answers: parsed.answers as AnswersByCategory,
      elapsedMs: readElapsed(parsed.elapsedMs),
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveState(state: StoredState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable or quota exceeded — fail silently.
  }
}

export function resetState(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
