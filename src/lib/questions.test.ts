import { describe, it, expect } from "vitest";
import type { Category } from "../data/types";
import {
  allowedAnswerIndices,
  askedQuestions,
  sanitizeAnswers,
  visibleQuestions,
} from "./questions";
import { scoreCategory } from "./scoring";

/** Synthetic category: one gateway + a follow-up gated on its non-innocent answer. */
const cat: Category = {
  id: "sexe",
  label: "Test",
  emoji: "🔬",
  color: "#000",
  questions: [
    {
      id: "t-01",
      text: "gateway",
      answers: [
        { label: "Jamais", points: 0 },
        { label: "Oui", points: 3 },
      ],
    },
    {
      id: "t-02",
      text: "follow-up",
      requires: { question: "t-01", minAnswerIndex: 1 },
      answers: [
        { label: "Un peu", points: 4 },
        { label: "Beaucoup", points: 10 },
      ],
    },
    {
      id: "t-03",
      text: "deep follow-up",
      requires: { question: "t-02", minAnswerIndex: 1 },
      answers: [
        { label: "Soft", points: 2 },
        { label: "Hardcore", points: 6 },
      ],
    },
  ],
};

describe("visibleQuestions", () => {
  it("hides a follow-up until its gateway clears the threshold", () => {
    expect(visibleQuestions(cat, {}).map((q) => q.id)).toEqual(["t-01"]);
    expect(visibleQuestions(cat, { "t-01": 0 }).map((q) => q.id)).toEqual(["t-01"]);
  });

  it("reveals the follow-up right after its gateway once unlocked", () => {
    expect(visibleQuestions(cat, { "t-01": 1 }).map((q) => q.id)).toEqual([
      "t-01",
      "t-02",
    ]);
  });

  it("supports chained follow-ups (a follow-up gating a deeper one)", () => {
    expect(
      visibleQuestions(cat, { "t-01": 1, "t-02": 1 }).map((q) => q.id),
    ).toEqual(["t-01", "t-02", "t-03"]);
  });

  it("re-hides a deep follow-up when an intermediate gateway is relocked", () => {
    // t-03 was unlocked, but t-02 is hidden again -> t-03 must vanish too.
    expect(
      visibleQuestions(cat, { "t-01": 0, "t-02": 1 }).map((q) => q.id),
    ).toEqual(["t-01"]);
  });
});

/** Synthetic category with logical prerequisites (single and any-of). */
const prerequisiteCategory: Category = {
  id: "drogue",
  label: "Test",
  emoji: "🔬",
  color: "#000",
  questions: [
    { id: "p-01", text: "tried A?", answers: [{ label: "No", points: 0 }, { label: "Yes", points: 2 }] },
    { id: "p-02", text: "tried B?", answers: [{ label: "No", points: 0 }, { label: "Yes", points: 2 }] },
    {
      id: "p-03",
      text: "only if A or B",
      onlyIf: [
        { question: "p-01", minAnswerIndex: 1 },
        { question: "p-02", minAnswerIndex: 1 },
      ],
      answers: [{ label: "Never", points: 0 }, { label: "Often", points: 3 }],
    },
    {
      id: "p-04",
      text: "follow-up of a prerequisite question",
      requires: { question: "p-03", minAnswerIndex: 1 },
      answers: [{ label: "Some", points: 1 }, { label: "Lots", points: 4 }],
    },
  ],
};

describe("visibleQuestions with logical prerequisites (onlyIf)", () => {
  const ids = (answers: Record<string, number>) =>
    visibleQuestions(prerequisiteCategory, answers).map((q) => q.id);

  it("hides a prerequisite question while no gate is met", () => {
    expect(ids({})).toEqual(["p-01", "p-02"]);
    expect(ids({ "p-01": 0, "p-02": 0 })).toEqual(["p-01", "p-02"]);
  });

  it("shows it as soon as any one gate is met", () => {
    expect(ids({ "p-01": 1, "p-02": 0 })).toEqual(["p-01", "p-02", "p-03"]);
    expect(ids({ "p-01": 0, "p-02": 1 })).toEqual(["p-01", "p-02", "p-03"]);
  });

  it("hides follow-ups of a prerequisite question when the prerequisite fails", () => {
    expect(ids({ "p-01": 1, "p-03": 1 })).toEqual(["p-01", "p-02", "p-03", "p-04"]);
    expect(ids({ "p-01": 0, "p-02": 0, "p-03": 1 })).toEqual(["p-01", "p-02"]);
  });

  it("ignores answers of a now-hidden prerequisite question in the score", () => {
    const r = scoreCategory(prerequisiteCategory, { "p-01": 0, "p-02": 0, "p-03": 1, "p-04": 1 });
    expect(r.score).toBe(0);
    expect(r.completed).toBe(true);
  });
});

describe("scoreCategory with conditional questions (cumulative model)", () => {
  it("counts the full bank in the denominator: the innocent path scores low", () => {
    // Max = best(t-01)=3 + best(t-02)=10 + best(t-03)=6 = 19.
    const r = scoreCategory(cat, { "t-01": 0 });
    expect(r.score).toBe(0); // 0 / 19
    expect(r.total).toBe(1); // only the gateway is visible
    expect(r.completed).toBe(true); // every visible question answered
  });

  it("marks the category incomplete the moment a follow-up unlocks", () => {
    const r = scoreCategory(cat, { "t-01": 1 });
    expect(r.total).toBe(2);
    expect(r.answered).toBe(1);
    expect(r.completed).toBe(false);
    expect(r.score).toBe(Math.round((3 / 19) * 100)); // 16
  });

  it("rewards exploring the unlocked topic", () => {
    const r = scoreCategory(cat, { "t-01": 1, "t-02": 1, "t-03": 1 });
    expect(r.score).toBe(100); // 3 + 10 + 6 = 19 / 19
    expect(r.completed).toBe(true);
  });

  it("ignores answers stored for a now-hidden question", () => {
    // t-02 answered high, but t-01 relocks it -> its points must not count.
    const r = scoreCategory(cat, { "t-01": 0, "t-02": 1 });
    expect(r.score).toBe(0);
  });
});

describe("answer limits", () => {
  const category: Category = {
    id: "alcool",
    label: "Test",
    emoji: "x",
    color: "#000",
    questions: [
      {
        id: "typical",
        text: "?",
        answers: [
          { label: "low", points: 0 },
          { label: "high", points: 1 },
        ],
      },
      {
        id: "record",
        text: "?",
        answerLimits: [{ question: "typical", allowed: { 1: [1, 2] } }],
        answers: [
          { label: "low", points: 0 },
          { label: "high", points: 1 },
          { label: "huge", points: 2 },
        ],
      },
    ],
  };
  const byId = new Map(category.questions.map((q) => [q.id, q]));
  const record = category.questions[1];

  it("keeps every answer while the gateway is unanswered or unrestricted", () => {
    expect(allowedAnswerIndices(record, byId, {})).toEqual([0, 1, 2]);
    expect(allowedAnswerIndices(record, byId, { typical: 0 })).toEqual([0, 1, 2]);
  });

  it("hides answers that contradict the gateway answer", () => {
    expect(allowedAnswerIndices(record, byId, { typical: 1 })).toEqual([1, 2]);
  });

  it("drops a stored answer that became contradictory", () => {
    expect(sanitizeAnswers(category, { typical: 1, record: 0 })).toEqual({ typical: 1 });
    expect(sanitizeAnswers(category, { typical: 1, record: 2 })).toEqual({ typical: 1, record: 2 });
  });

  it("answers and skips a question left with a single possible answer", () => {
    const narrowed: Category = {
      ...category,
      questions: [
        category.questions[0],
        { ...record, answerLimits: [{ question: "typical", allowed: { 1: [2] } }] },
      ],
    };
    expect(sanitizeAnswers(narrowed, { typical: 1 })).toEqual({ typical: 1, record: 2 });
    expect(askedQuestions(narrowed, { typical: 1 }).map((q) => q.id)).toEqual(["typical"]);
    expect(askedQuestions(narrowed, { typical: 0 }).map((q) => q.id)).toEqual(["typical", "record"]);
  });
});
