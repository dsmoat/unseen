import { describe, expect, it } from "vitest";
import { buildDailyCompanyPulse, consolidateObservations } from "../src/lib/dailyPulse";
import type { Observation } from "../src/types";

const base = {
  confidence: 0.9,
  ownerParticipantIds: ["p1"],
  affectedParticipantIds: ["p2"],
  teamIds: ["delivery"],
  entityIds: ["project-a"],
  sourceMessageIds: ["m1"],
  tags: ["release"],
  extractionMode: "deterministic" as const,
};

const observations: Observation[] = [
  {
    ...base,
    id: "o1",
    fingerprint: "project-a:release-delay",
    kind: "blocker",
    summary: "Release is blocked by environment access",
    status: "open",
    severity: 4,
    observedAt: "2026-07-17T09:00:00.000Z",
  },
  {
    ...base,
    id: "o2",
    fingerprint: "project-a:release-delay",
    kind: "blocker",
    summary: "Release remains blocked by environment access",
    status: "watching",
    severity: 4,
    observedAt: "2026-07-18T09:00:00.000Z",
    sourceMessageIds: ["m2"],
  },
  {
    ...base,
    id: "o3",
    fingerprint: "project-a:test-progress",
    kind: "progress",
    summary: "Regression testing reached 80%",
    status: "open",
    severity: 2,
    observedAt: "2026-07-18T10:00:00.000Z",
    ownerParticipantIds: ["p2"],
    affectedParticipantIds: [],
    sourceMessageIds: ["m3"],
  },
];

describe("daily company pulse", () => {
  it("consolidates repeated observations without losing evidence history", () => {
    const consolidated = consolidateObservations(observations);
    const blocker = consolidated.find(
      (item) => item.fingerprint === "project-a:release-delay",
    )!;
    expect(blocker.occurrenceCount).toBe(2);
    expect(blocker.status).toBe("watching");
    expect(blocker.sourceMessageIds).toEqual(["m1", "m2"]);
    expect(blocker.firstObservedAt).toBe("2026-07-17T09:00:00.000Z");
  });

  it("builds one company view and employee drill-downs from the same records", () => {
    const { pulse, alerts } = buildDailyCompanyPulse(
      observations,
      "2026-07-18",
    );
    expect(pulse.status).toBe("attention");
    expect(pulse.metrics.blockers).toBe(1);
    expect(pulse.metrics.newToday).toBe(1);
    expect(alerts[0].status).toBe("ongoing");
    expect(alerts[0].sourceObservationIds).toEqual(["o1", "o2"]);
    expect(
      pulse.employeeDigests.find((item) => item.participantId === "p1")
        ?.blockerCount,
    ).toBe(1);
    expect(
      pulse.employeeDigests.find((item) => item.participantId === "p2")
        ?.progressCount,
    ).toBe(1);
  });

  it("does not include future observations in an earlier pulse", () => {
    const { pulse } = buildDailyCompanyPulse(observations, "2026-07-17");
    expect(pulse.metrics.newToday).toBe(1);
    expect(pulse.topProgressObservationIds).toHaveLength(0);
  });
});
