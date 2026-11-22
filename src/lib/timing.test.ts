import { describe, it, expect } from "vitest";
import { MAX_GAP_MS, activeGap, formatDuration } from "./timing";

describe("activeGap", () => {
  it("counts nothing before the first action", () => {
    expect(activeGap(null, 5000)).toBe(0);
  });

  it("counts the time since the previous action, capped for pauses", () => {
    expect(activeGap(1000, 9000)).toBe(8000);
    expect(activeGap(0, 60 * 60 * 1000)).toBe(MAX_GAP_MS);
    expect(activeGap(9000, 1000)).toBe(0);
  });
});

describe("formatDuration", () => {
  it("formats minutes and hours", () => {
    expect(formatDuration(20_000)).toBe("moins d'une minute");
    expect(formatDuration(60_000)).toBe("1 min");
    expect(formatDuration(12 * 60_000 + 20_000)).toBe("12 min");
    expect(formatDuration(65 * 60_000)).toBe("1 h 05");
  });
});
