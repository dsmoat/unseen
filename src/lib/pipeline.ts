import type { Message, BusinessSignal, Claim, Opportunity } from "../types";
const groups = <T>(xs: T[], key: (x: T) => string) =>
  xs.reduce<Record<string, T[]>>((a, x) => {
    (a[key(x)] ??= []).push(x);
    return a;
  }, {});
export const reconstructThreads = (messages: Message[]) =>
  Object.values(groups(messages, (m) => m.threadId)).map((ms) => ({
    id: ms![0].threadId,
    messages: ms!.toSorted((a, b) => a.sentAt.localeCompare(b.sentAt)),
    participants: [
      ...new Set(
        ms!.flatMap((m) => [
          m.senderId,
          ...m.recipientIds,
          ...m.mentionedParticipantIds,
        ]),
      ),
    ],
    confidence: ms!.every((m) => m.replyToMessageId || m === ms![0])
      ? 0.96
      : 0.72,
  }));
export const extractParticipants = (messages: Message[]) => [
  ...new Set(
    messages.flatMap((m) => [
      m.senderId,
      ...m.recipientIds,
      ...m.mentionedParticipantIds,
    ]),
  ),
];
export const createClaims = (signals: BusinessSignal[]) =>
  signals
    .filter((s) => s.type === "Assumption")
    .map(
      (s) =>
        ({
          id: `claim-${s.id}`,
          subjectEntityId: s.entityIds[0],
          predicate: "assumed",
          objectValue: s.title,
          claimantParticipantId: "unknown",
          sourceMessageIds: s.sourceMessageIds,
          confidence: s.confidence,
          stance: "asserts",
          verificationStatus: "unverified",
        }) as Claim,
    );
export const detectContradictions = (claims: Claim[]) =>
  Object.values(groups(claims, (c) => `${c.subjectEntityId}:${c.predicate}`))
    .filter((g) => new Set(g!.map((c) => c.objectValue)).size > 1)
    .map((g, i) => ({
      id: `ctr${i + 1}`,
      claims: g!,
      confidence: 0.88,
      why: "Different teams attribute the same outcome to incompatible primary causes.",
      missingEvidence: "Direct customer ranking of causes",
      question: "Which cause most affects a purchase or rollout decision?",
    }));
export const groupProblems = (signals: BusinessSignal[]) =>
  Object.values(
    groups(
      signals.filter((s) =>
        ["Problem", "Customer request", "Complaint", "Workaround"].includes(
          s.type,
        ),
      ),
      (s) => s.tags[0],
    ),
  )
    .filter((g) => g!.length > 1)
    .map((g) => ({ tag: g![0].tags[0], occurrences: g!.length, signals: g! }));
export const detectAbandoned = (signals: BusinessSignal[]) =>
  signals
    .filter((s) => s.type === "Proposal")
    .filter((p) =>
      signals.some(
        (s) => s.tags.some((t) => p.tags.includes(t)) && s.type === "Blocker",
      ),
    )
    .map((p) => ({
      proposal: p,
      reason: "Technology immaturity and/or missing ownership",
      reconsiderationScore: 83,
    }));
export const discoverCapabilities = (signals: BusinessSignal[]) =>
  signals.filter((s) => ["Capability", "Expertise"].includes(s.type));
export const scoreOpportunity = (o: Opportunity) =>
  Math.round(
    (o.evidenceStrength +
      o.strategicFit +
      o.capabilityReadiness +
      o.customerAccess +
      (100 - o.uncertainty)) /
      5,
  );
export const applyValidation = (
  score: number,
  answer: "yes" | "no" | "unknown",
  verified: boolean,
) =>
  Math.max(
    0,
    Math.min(
      100,
      score +
        (answer === "yes" ? 1 : answer === "no" ? -1 : 0) * (verified ? 8 : 3),
    ),
  );
export const learningWeight = (
  weight: number,
  result: "confirmed" | "rejected",
  customerEvidence: boolean,
) =>
  Math.max(
    0,
    Math.min(
      2,
      weight +
        (result === "confirmed" ? 0.15 : -0.15) +
        (customerEvidence ? 0.1 : -0.05),
    ),
  );
