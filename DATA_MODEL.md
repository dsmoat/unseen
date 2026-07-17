# Data model

`migrations/0001_initial.sql` defines 27 relational tables with practical foreign keys and provenance junctions. Raw `messages` remain separate from `business_signals`, `claims`, patterns, and opportunities. `signal_evidence`, `claim_evidence`, and `opportunity_evidence` preserve source traceability. Confidence, extraction/review state, time, outcomes, and human learning approval are explicit.

## Import shape

```ts
type Message = {
  id: string;
  sourceType: "email" | "chat";
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
```

The endpoint accepts a JSON array. Production persistence should sanitize display text, enforce size/count limits, validate ISO timestamps and enumerations, and reject unknown fields. React escapes displayed text by default; the application does not use raw HTML injection.
