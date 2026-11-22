import { describe, it, expect } from "vitest";
import { categories } from "../data/categories";
import type { CategoryId } from "../data/types";
import { HIGHLIGHTS, buildPortrait } from "./portrait";

const zeroScores = Object.fromEntries(categories.map((c) => [c.id, 0])) as Record<CategoryId, number>;

describe("buildPortrait", () => {
  it("highlights point at real questions and answers", () => {
    const byId = new Map(categories.flatMap((c) => c.questions).map((q) => [q.id, q]));
    for (const h of HIGHLIGHTS) {
      const question = byId.get(h.question);
      expect(question, h.question).toBeDefined();
      expect(h.minAnswerIndex).toBeLessThan(question!.answers.length);
    }
  });

  it("describes a fully innocent player without highlights", () => {
    const portrait = buildPortrait(zeroScores, {});
    expect(portrait).toHaveLength(2);
    expect(portrait[0]).toContain("pureté rare");
  });

  it("contrasts the strongest and weakest categories", () => {
    const portrait = buildPortrait({ ...zeroScores, alcool: 90 });
    expect(portrait[0]).toContain("sage en");
    expect(portrait[0]).toContain("alcool");
  });

  it("quotes striking answers only when their question is shown", () => {
    // hard drugs answered while the question is ungated -> quoted
    const withDrugs = buildPortrait(zeroScores, { drogue: { "drogue-13": 2 } });
    expect(withDrugs.at(-1)).toContain("drogues dures");
    // a party answer stored while its gateway says "never" is hidden -> not quoted
    const hidden = buildPortrait(zeroScores, { sexe: { "sexe-19": 0, "sexe-20": 2 } });
    expect(hidden.join(" ")).not.toContain("partouze");
  });

  it("speaks about someone else on a shared result", () => {
    const portrait = buildPortrait({ ...zeroScores, sexe: 80 }, undefined, "shared");
    expect(portrait).toHaveLength(2);
    expect(portrait.join(" ")).not.toMatch(/(tu|ton|ta|tes)/i);
  });
});
