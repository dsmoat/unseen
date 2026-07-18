# JRISE pipeline redesign for UNSEEN

## Goal

Produce a useful daily company status and alerts first, while preserving employee-level drill-down and evidence provenance.

## What changes

The old pattern repeatedly asks an LLM to create employee summaries and then merge today's generated text with prior generated text. That makes prompts numerous, slow, difficult to test, and vulnerable to summary drift.

UNSEEN now uses one canonical observation stream:

```text
Messages
  -> normalize and reconstruct threads
  -> extract immutable observations once
  -> assign deterministic fingerprint and provenance
  -> consolidate observation history by fingerprint
  -> derive daily company pulse, alerts, team views, and employee digests
  -> human review for low-confidence or high-severity items
```

## Processing rules

1. **Extraction is atomic.** One message can produce zero or more observations. An observation describes one progress item, decision, blocker, risk, commitment, dependency, customer signal, capacity signal, quality signal, or material change.
2. **Evidence is never overwritten.** Each observation retains source message IDs, owners, affected people, teams, entities, confidence, and extraction mode.
3. **Historical consolidation is state reduction, not text rewriting.** A stable `fingerprint` groups observations about the same real-world topic. The latest observation supplies current status; all prior observation and source IDs remain attached.
4. **Company and employee views are projections.** The daily company pulse and every employee digest are derived from the same consolidated records. There is no separate employee-summary prompt.
5. **Alerts are rule-first.** Open blockers, risks, quality signals, and capacity signals above a severity threshold become alerts. LLM wording can be added later, but alert eligibility and score calculations remain testable.
6. **Human review is risk-based.** High severity, low confidence, contradictory state changes, or unknown ownership should enter a review queue instead of forcing all records through another prompt.

## Data products

- `Observation`: immutable extraction result.
- `ConsolidatedObservation`: current state plus complete occurrence and evidence history.
- `DailyAlert`: new, ongoing, or resolved management attention item.
- `DailyCompanyPulse`: headline, health score, status, metrics, alerts, and top progress.
- `EmployeeDigest`: participant-specific drill-down derived from the same observations.

## Prompt boundary

Only the observation extraction step requires an LLM in AI mode. Consolidation, alerting, scoring, aggregation, and employee/company projections are deterministic. Optional LLM generation may summarize an already-built pulse for presentation, but it must not change the underlying state.

## Next integration step

Wire `buildDailyCompanyPulse` into the Worker pipeline endpoint and add a Company Pulse dashboard route that reads the returned pulse, alerts, consolidated observations, and employee digests. Persist observations and daily snapshots in D1 after the repository adapter is introduced.
