export type SourceType = "email" | "chat";
export type Message = {
  id: string;
  sourceType: SourceType;
  sourceSystem: "outlook" | "gmail" | "teams" | "slack" | "demo";
  threadId: string;
  subject?: string;
  senderId: string;
  recipientIds: string[];
  mentionedParticipantIds: string[];
  sentAt: string;
  language: string;
  content: string;
  translatedContent?: string;
  replyToMessageId?: string;
};
export type Participant = {
  id: string;
  name: string;
  role: string;
  team: string;
  location: string;
  organization: string;
};
export type SignalType =
  | "Problem"
  | "Customer request"
  | "Complaint"
  | "Unmet need"
  | "Workaround"
  | "Idea"
  | "Proposal"
  | "Assumption"
  | "Decision"
  | "Rejected option"
  | "Commitment"
  | "Blocker"
  | "Capability"
  | "Expertise"
  | "Experiment"
  | "Outcome"
  | "Risk"
  | "Opportunity signal";
export type BusinessSignal = {
  id: string;
  type: SignalType;
  title: string;
  description: string;
  entityIds: string[];
  sourceMessageIds: string[];
  firstObservedAt: string;
  lastObservedAt: string;
  confidence: number;
  extractionMode: "ai" | "deterministic" | "human";
  status: "unreviewed" | "confirmed" | "corrected" | "rejected";
  tags: string[];
};

export type ObservationKind =
  | "progress"
  | "decision"
  | "commitment"
  | "blocker"
  | "risk"
  | "customer_signal"
  | "capacity_signal"
  | "quality_signal"
  | "dependency"
  | "change";

export type ObservationStatus =
  | "open"
  | "watching"
  | "resolved"
  | "cancelled";

/**
 * Immutable, evidence-linked extraction output. Historical consolidation updates
 * derived state, never the source observation itself.
 */
export type Observation = {
  id: string;
  fingerprint: string;
  kind: ObservationKind;
  summary: string;
  detail?: string;
  status: ObservationStatus;
  severity: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  observedAt: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  ownerParticipantIds: string[];
  affectedParticipantIds: string[];
  teamIds: string[];
  entityIds: string[];
  sourceMessageIds: string[];
  tags: string[];
  extractionMode: "ai" | "deterministic" | "human";
};

export type ConsolidatedObservation = Observation & {
  firstObservedAt: string;
  lastObservedAt: string;
  occurrenceCount: number;
  observationIds: string[];
  sourceMessageIds: string[];
};

export type DailyAlert = {
  id: string;
  fingerprint: string;
  title: string;
  reason: string;
  severity: 1 | 2 | 3 | 4 | 5;
  status: "new" | "ongoing" | "resolved";
  ownerParticipantIds: string[];
  teamIds: string[];
  sourceObservationIds: string[];
  sourceMessageIds: string[];
};

export type EmployeeDigest = {
  participantId: string;
  activeObservationIds: string[];
  ownedObservationIds: string[];
  alertIds: string[];
  progressCount: number;
  blockerCount: number;
  riskCount: number;
};

export type DailyCompanyPulse = {
  date: string;
  generatedAt: string;
  healthScore: number;
  status: "stable" | "attention" | "critical";
  headline: string;
  metrics: {
    active: number;
    newToday: number;
    resolvedToday: number;
    blockers: number;
    risks: number;
    teamsAffected: number;
  };
  alertIds: string[];
  topProgressObservationIds: string[];
  employeeDigests: EmployeeDigest[];
};

export type Claim = {
  id: string;
  subjectEntityId: string;
  predicate: string;
  objectValue: string;
  claimantParticipantId: string;
  sourceMessageIds: string[];
  confidence: number;
  stance: "asserts" | "denies" | "questions" | "uncertain";
  verificationStatus:
    | "unverified"
    | "supported"
    | "contradicted"
    | "human_confirmed"
    | "rejected";
};
export type Opportunity = {
  id: string;
  title: string;
  problemStatement: string;
  targetUsers: string;
  proposedValue: string;
  supportingSignalIds: string[];
  capabilityIds: string[];
  contradictionIds: string[];
  abandonedIdeaIds: string[];
  evidenceStrength: number;
  strategicFit: number;
  capabilityReadiness: number;
  customerAccess: number;
  uncertainty: number;
  overallScore: number;
  assumptions: string[];
  unknowns: string[];
  status:
    | "generated"
    | "under_review"
    | "validated"
    | "rejected"
    | "experimenting";
};
