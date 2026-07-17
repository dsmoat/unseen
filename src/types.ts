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
