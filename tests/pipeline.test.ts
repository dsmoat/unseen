import { describe, it, expect } from "vitest";
import { messages, signals, claims, opportunities } from "../src/data/demo";
import {
  reconstructThreads,
  extractParticipants,
  createClaims,
  detectContradictions,
  groupProblems,
  detectAbandoned,
  discoverCapabilities,
  scoreOpportunity,
  applyValidation,
  learningWeight,
} from "../src/lib/pipeline";
describe("deterministic pipeline", () => {
  it("reconstructs ordered threads and reply participants", () => {
    const t = reconstructThreads(messages);
    expect(t).toHaveLength(8);
    expect(t[0].messages[0].sentAt < t[0].messages[1].sentAt).toBe(true);
    expect(t[0].participants).toContain("p4");
  });
  it("extracts unique participants including mentions", () =>
    expect(extractParticipants(messages)).toHaveLength(8));
  it("creates claims only from explicit assumptions", () =>
    expect(
      createClaims(signals).every((c) => c.verificationStatus === "unverified"),
    ).toBe(true));
  it("keeps incompatible claims separate", () => {
    const c = detectContradictions(claims);
    expect(c).toHaveLength(1);
    expect(c[0].claims).toHaveLength(3);
  });
  it("groups repeated problems deterministically", () =>
    expect(groupProblems(signals).length).toBeGreaterThanOrEqual(2));
  it("recovers blocked proposals", () =>
    expect(detectAbandoned(signals)[0].reconsiderationScore).toBe(83));
  it("discovers at least three capabilities", () =>
    expect(discoverCapabilities(signals)).toHaveLength(3));
  it("scores opportunity dimensions", () =>
    expect(scoreOpportunity(opportunities[1])).toBe(80));
  it("updates score more for verified answers", () => {
    expect(applyValidation(70, "yes", true)).toBe(78);
    expect(applyValidation(70, "no", false)).toBe(67);
  });
  it("updates explainable learning weights", () =>
    expect(learningWeight(1, "confirmed", true)).toBeCloseTo(1.25));
});
