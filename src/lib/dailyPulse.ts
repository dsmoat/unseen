import type {
  ConsolidatedObservation,
  DailyAlert,
  DailyCompanyPulse,
  EmployeeDigest,
  Observation,
} from "../types";

const unique = <T>(items: T[]) => [...new Set(items)];
const sameDay = (iso: string, date: string) => iso.slice(0, 10) === date;

/**
 * Consolidate immutable observations into the latest known state of each topic.
 * A stable fingerprint replaces prompt-based "merge today's text with yesterday".
 */
export function consolidateObservations(
  observations: Observation[],
): ConsolidatedObservation[] {
  const byFingerprint = observations.reduce<Record<string, Observation[]>>(
    (groups, observation) => {
      (groups[observation.fingerprint] ??= []).push(observation);
      return groups;
    },
    {},
  );

  return Object.values(byFingerprint)
    .map((history) => {
      const ordered = [...history].sort((a, b) =>
        a.observedAt.localeCompare(b.observedAt),
      );
      const latest = ordered.at(-1)!;
      return {
        ...latest,
        firstObservedAt: ordered[0].observedAt,
        lastObservedAt: latest.observedAt,
        occurrenceCount: ordered.length,
        observationIds: ordered.map((item) => item.id),
        sourceMessageIds: unique(
          ordered.flatMap((item) => item.sourceMessageIds),
        ),
        ownerParticipantIds: unique(
          ordered.flatMap((item) => item.ownerParticipantIds),
        ),
        affectedParticipantIds: unique(
          ordered.flatMap((item) => item.affectedParticipantIds),
        ),
        teamIds: unique(ordered.flatMap((item) => item.teamIds)),
        entityIds: unique(ordered.flatMap((item) => item.entityIds)),
        tags: unique(ordered.flatMap((item) => item.tags)),
      };
    })
    .sort((a, b) => b.lastObservedAt.localeCompare(a.lastObservedAt));
}

export function deriveDailyAlerts(
  consolidated: ConsolidatedObservation[],
  date: string,
): DailyAlert[] {
  return consolidated
    .filter(
      (item) =>
        ["blocker", "risk", "quality_signal", "capacity_signal"].includes(
          item.kind,
        ) && (item.status !== "resolved" || sameDay(item.lastObservedAt, date)),
    )
    .filter((item) => item.severity >= 3)
    .map((item) => ({
      id: `alert-${item.fingerprint}`,
      fingerprint: item.fingerprint,
      title: item.summary,
      reason:
        item.status === "resolved"
          ? "Resolved today; verify that downstream impact is closed."
          : item.occurrenceCount > 1
            ? `Repeated ${item.occurrenceCount} times and remains ${item.status}.`
            : `New ${item.kind.replace("_", " ")} requiring attention.`,
      severity: item.severity,
      status: item.status === "resolved"
        ? "resolved"
        : sameDay(item.firstObservedAt, date)
          ? "new"
          : "ongoing",
      ownerParticipantIds: item.ownerParticipantIds,
      teamIds: item.teamIds,
      sourceObservationIds: item.observationIds,
      sourceMessageIds: item.sourceMessageIds,
    }))
    .sort((a, b) => b.severity - a.severity);
}

function buildEmployeeDigests(
  observations: ConsolidatedObservation[],
  alerts: DailyAlert[],
): EmployeeDigest[] {
  const participantIds = unique(
    observations.flatMap((item) => [
      ...item.ownerParticipantIds,
      ...item.affectedParticipantIds,
    ]),
  );

  return participantIds.map((participantId) => {
    const related = observations.filter(
      (item) =>
        item.ownerParticipantIds.includes(participantId) ||
        item.affectedParticipantIds.includes(participantId),
    );
    return {
      participantId,
      activeObservationIds: related
        .filter((item) => !["resolved", "cancelled"].includes(item.status))
        .map((item) => item.id),
      ownedObservationIds: related
        .filter((item) => item.ownerParticipantIds.includes(participantId))
        .map((item) => item.id),
      alertIds: alerts
        .filter(
          (alert) =>
            alert.ownerParticipantIds.includes(participantId) ||
            related.some((item) => item.fingerprint === alert.fingerprint),
        )
        .map((alert) => alert.id),
      progressCount: related.filter((item) => item.kind === "progress").length,
      blockerCount: related.filter(
        (item) => item.kind === "blocker" && item.status !== "resolved",
      ).length,
      riskCount: related.filter(
        (item) => item.kind === "risk" && item.status !== "resolved",
      ).length,
    };
  });
}

export function buildDailyCompanyPulse(
  observations: Observation[],
  date: string,
  generatedAt = `${date}T23:59:59.000Z`,
): {
  consolidated: ConsolidatedObservation[];
  alerts: DailyAlert[];
  pulse: DailyCompanyPulse;
} {
  const consolidated = consolidateObservations(
    observations.filter((item) => item.observedAt.slice(0, 10) <= date),
  );
  const alerts = deriveDailyAlerts(consolidated, date);
  const active = consolidated.filter(
    (item) => !["resolved", "cancelled"].includes(item.status),
  );
  const blockers = active.filter((item) => item.kind === "blocker").length;
  const risks = active.filter((item) => item.kind === "risk").length;
  const severeAlerts = alerts.filter(
    (alert) => alert.status !== "resolved" && alert.severity >= 4,
  ).length;
  const healthScore = Math.max(
    0,
    Math.min(100, 100 - blockers * 12 - risks * 8 - severeAlerts * 6),
  );
  const status =
    healthScore < 55 ? "critical" : healthScore < 80 ? "attention" : "stable";
  const topProgress = consolidated
    .filter((item) => item.kind === "progress")
    .sort(
      (a, b) =>
        b.severity - a.severity || b.lastObservedAt.localeCompare(a.lastObservedAt),
    )
    .slice(0, 5);

  return {
    consolidated,
    alerts,
    pulse: {
      date,
      generatedAt,
      healthScore,
      status,
      headline:
        status === "stable"
          ? "Operations are stable; continue monitoring open dependencies."
          : status === "attention"
            ? `${alerts.filter((item) => item.status !== "resolved").length} alerts need management attention.`
            : "Critical blockers or risks require immediate ownership and follow-up.",
      metrics: {
        active: active.length,
        newToday: consolidated.filter((item) => sameDay(item.firstObservedAt, date))
          .length,
        resolvedToday: consolidated.filter(
          (item) => item.status === "resolved" && sameDay(item.lastObservedAt, date),
        ).length,
        blockers,
        risks,
        teamsAffected: unique(active.flatMap((item) => item.teamIds)).length,
      },
      alertIds: alerts.map((item) => item.id),
      topProgressObservationIds: topProgress.map((item) => item.id),
      employeeDigests: buildEmployeeDigests(consolidated, alerts),
    },
  };
}
