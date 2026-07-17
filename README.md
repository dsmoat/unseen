# UNSEEN

UNSEEN is a deployable, fictional-data demonstrator that turns organizational email and chat into evidence-linked signals, claims, temporal relationships, patterns, opportunity **hypotheses**, validation questions, experiments, outcomes, and explainable learning rules. It deliberately distinguishes source evidence, extracted observations, participant claims, generated hypotheses, human conclusions, and unknowns.

## Architecture

```text
React/Vite static UI ──fetch──> Hono Cloudflare Worker
                                  ├─ D1 (normalized records + provenance)
Messages → reconstruction → extraction → claims → pattern engines
                                                  ↓
D1 evidence ← learning ← outcomes ← experiments ← opportunities
                                  ├─ Workers AI (optional structured JSON)
                                  └─ Vectorize (optional similarity)
```

| Layer                 | Technology                                                        |
| --------------------- | ----------------------------------------------------------------- |
| Interface             | React, TypeScript, Vite, responsive CSS                           |
| Edge API/hosting      | Hono on Cloudflare Workers + static assets                        |
| Persistence           | Cloudflare D1 migrations                                          |
| Optional intelligence | Workers AI behind one validated service; Vectorize for similarity |
| Zero-binding fallback | Deterministic fixtures and explainable rules                      |

## Repository

- `src/data/demo.ts`: 40 fictional multilingual messages and precomputed evidence-linked records.
- `src/lib/pipeline.ts`: deterministic reconstruction, pattern, scoring, validation, and learning logic.
- `src/main.tsx`: routed dashboard, review workflows, guided tour, graph, and feedback loop.
- `worker/`: typed API and centralized AI abstraction.
- `migrations/`, `scripts/`: D1 schema and seed marker.
- `tests/`: deterministic unit, API, and full learning-loop coverage.

See [ARCHITECTURE.md](ARCHITECTURE.md) and [DATA_MODEL.md](DATA_MODEL.md).

## Run locally

```bash
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

Open the Vite URL, choose **Load sample**, then **Run analysis pipeline**. Deterministic mode needs no credentials. Use **Start guided tour** for the five-minute narrative. The sample import schema is an array of normalized `Message` objects as documented in `DATA_MODEL.md`; uploaded/pasted content is a demonstration extension point and never connects to Gmail, Outlook, Teams, or Slack.

## AI mode and safety

`DeterministicService` supplies the whole demo without external services. `WorkersAIService` is the only model-call boundary: it limits input, requests concise structured JSON, validates with Zod, retries malformed responses, and logs only an error code/attempt—not message bodies. Configure `UNSEEN_MODE=ai` only after binding both AI and Vectorize. Incomplete bindings leave the app in deterministic mode. No third-party AI is used.

The demo does not infer intent, personality, performance, or agreement from silence. It does not use sentiment as a business conclusion. Full message bodies are not logged. It does not autonomously retrain; outcome-driven weight changes await human approval.

## Cloudflare dashboard + GitHub deployment

1. Push this repository to a GitHub repository using Codex/GitHub.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository**; select the repository.
3. Set build command `npm run build`, deploy command `npx wrangler deploy`, and production branch `main` (or your chosen branch).
4. Dashboard → **Storage & Databases → D1**: create `unseen-demo`. Apply `migrations/0001_initial.sql`, then `scripts/seed.sql` in the SQL console.
5. Worker → **Settings → Bindings**: add D1 binding `DB` to that database; Workers AI binding `AI`; create a Vectorize index named `unseen-signals` and bind it as `VECTOR_INDEX`.
6. Worker → **Settings → Variables**: set `UNSEEN_MODE` to `deterministic` initially. Optional: set `AI_MODEL` to an available Workers AI structured-generation model. These are not secrets.
7. Replace the placeholder D1 ID in `wrangler.toml` only in Cloudflare's generated deployment configuration or a non-public environment-specific file. Never commit account IDs, API tokens, or real communication data.
8. Trigger a GitHub deployment, open `/api/health`, and verify `ok: true`. Open the root URL and load/reset the fictional dataset.

Required production bindings are `DB`; optional AI-mode bindings are `AI` and `VECTOR_INDEX`. Git integration supplies Cloudflare authentication—no API token belongs in this repository. `.env.example` documents safe local defaults.

## Demonstrating the product

1. Overview: inspect counts and run visible deterministic pipeline progress.
2. Conversations: inspect multilingual source threads, participants, translations, reply order, and reconstruction confidence.
3. Signals/Claim Ledger: review observations and compare the three unresolved explanations.
4. Patterns/Graph: inspect repeated approval and knowledge-loss patterns, capabilities, and the archived risk proposal.
5. Opportunities: inspect three hypotheses, provenance, assumptions, unknowns, and scores—no invented TAM or revenue.
6. Validation: record verified evidence and observe the transparent score delta.
7. Experiments: generate/edit/approve the cheapest useful test.
8. Outcomes/Learning: record an outcome, inspect the resulting weight change, and approve it.

## API

The Worker implements health, demo load/reset, conversations/import, pipeline runs, signals, claims, graph/events, four pattern endpoints, opportunities/questions, validation answers, experiments, outcomes, and learnings. Errors have `{ "error": { "code", "message" } }` and appropriate HTTP status codes.

## Known limitations / next steps

State is fixture-backed in the zero-configuration demonstration; D1 repository adapters and durable per-user sessions are the next production-hardening task. The focused graph is intentionally small and uses a lightweight native SVG/CSS interaction rather than a dense graph engine. Upload/paste controls demonstrate safe ingestion affordances; persistent import requires the D1 adapter. AI extraction is an extension point and must be evaluated on domain data before use. Authentication, OAuth connectors, tenancy, and employee evaluation are intentionally out of scope.

**Recommended next Codex task:** implement a D1 repository interface with deterministic/D1 adapters, migration integration tests, and authenticated single-organization access while preserving evidence provenance.
