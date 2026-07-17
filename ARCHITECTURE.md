# Architecture

UNSEEN is one Cloudflare deployment: Vite emits static assets served by the Worker; Hono handles `/api/*`; D1 holds raw and derived records separately. The UI never calls a model. `worker/ai-service.ts` owns optional Workers AI calls, validation, retry, input bounds, and privacy-safe errors. Vectorize is an optional semantic candidate generator; deterministic tags and mappings provide the same complete story without bindings.

## Pipeline boundaries

1. Normalize messages and reconstruct chronological threads/participants.
2. Extract evidence-linked observations; malformed AI records never cross schema validation.
3. Preserve claims independently, including incompatible claims.
4. Resolve evidence entities and time-stamped relationships.
5. Run contradictions, repeated-problem, abandoned-idea, and capability engines.
6. Score hypotheses from evidence, fit, readiness, access, and visible uncertainty.
7. Human answers create explainable deltas; experiments test the riskiest assumption.
8. Outcomes generate reviewable rule changes rather than claims of retraining.

Caching belongs at completed `pipeline_runs`; a content hash of normalized message IDs and model/rule version is the intended key. Raw-message access and derived-record review should be separately authorized in a production adapter.
