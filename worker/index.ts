import { Hono } from "hono";
import { z } from "zod";
import {
  messages,
  signals,
  claims,
  opportunities,
  participants,
} from "../src/data/demo";
import {
  reconstructThreads,
  detectContradictions,
  groupProblems,
  detectAbandoned,
  discoverCapabilities,
} from "../src/lib/pipeline";
type Env = {
  DB?: D1Database;
  AI?: Ai;
  VECTOR_INDEX?: VectorizeIndex;
  ASSETS: Fetcher;
  UNSEEN_MODE?: string;
};
const app = new Hono<{ Bindings: Env }>();
let demoLoaded = true;
let answers: any[] = [];
let experiments: any[] = [];
let outcomes: any[] = [];
let learnings: any[] = [];
const err = (c: any, status: number, code: string, message: string) =>
  c.json({ error: { code, message } }, status);
app.get("/api/health", (c) =>
  c.json({ ok: true, mode: c.env.UNSEEN_MODE || "deterministic" }),
);
app.get("/api/demo/status", (c) =>
  c.json({
    loaded: demoLoaded,
    mode: c.env.AI && c.env.VECTOR_INDEX ? "ai" : "deterministic",
    fictional: true,
  }),
);
app.post("/api/demo/load", (c) => {
  demoLoaded = true;
  return c.json({ loaded: true, messages: messages.length });
});
app.post("/api/demo/reset", (c) => {
  demoLoaded = false;
  answers = [];
  experiments = [];
  outcomes = [];
  learnings = [];
  return c.json({ loaded: false });
});
app.get("/api/conversations", (c) =>
  c.json(demoLoaded ? reconstructThreads(messages) : []),
);
app.get("/api/conversations/:id", (c) => {
  const x = reconstructThreads(messages).find(
    (t) => t.id === c.req.param("id"),
  );
  return x ? c.json(x) : err(c, 404, "NOT_FOUND", "Conversation not found");
});
app.post("/api/messages/import", async (c) => {
  let x;
  try {
    x = await c.req.json();
  } catch {
    return err(c, 400, "INVALID_JSON", "A valid JSON body is required");
  }
  if (!Array.isArray(x))
    return err(
      c,
      422,
      "INVALID_MESSAGES",
      "Expected an array of normalized messages",
    );
  return c.json({ accepted: x.length }, 201);
});
app.post("/api/pipeline/run", (c) =>
  c.json({
    id: "run-demo",
    mode: "deterministic",
    status: "completed",
    stages: 8,
  }),
);
app.get("/api/pipeline/runs/:id", (c) =>
  c.req.param("id") === "run-demo"
    ? c.json({ id: "run-demo", status: "completed" })
    : err(c, 404, "NOT_FOUND", "Pipeline run not found"),
);
app.get("/api/signals", (c) => c.json(signals));
app.patch("/api/signals/:id", (c) =>
  signals.some((x) => x.id === c.req.param("id"))
    ? c.json({ id: c.req.param("id"), updated: true })
    : err(c, 404, "NOT_FOUND", "Signal not found"),
);
app.get("/api/claims", (c) => c.json(claims));
app.patch("/api/claims/:id", (c) =>
  claims.some((x) => x.id === c.req.param("id"))
    ? c.json({ id: c.req.param("id"), updated: true })
    : err(c, 404, "NOT_FOUND", "Claim not found"),
);
app.get("/api/graph", (c) =>
  c.json({
    nodes: [
      ...participants.map((p) => ({ id: p.id, type: "person", label: p.name })),
      ...opportunities.map((o) => ({
        id: o.id,
        type: "opportunity",
        label: o.title,
      })),
    ],
    edges: [],
  }),
);
app.get("/api/events", (c) =>
  c.json(
    messages.map((m) => ({ id: m.id, at: m.sentAt, threadId: m.threadId })),
  ),
);
app.get("/api/patterns", (c) =>
  c.json({
    contradictions: detectContradictions(claims),
    repeatedProblems: groupProblems(signals),
    abandonedIdeas: detectAbandoned(signals),
    capabilities: discoverCapabilities(signals),
  }),
);
app.get("/api/patterns/contradictions", (c) =>
  c.json(detectContradictions(claims)),
);
app.get("/api/patterns/repeated-problems", (c) =>
  c.json(groupProblems(signals)),
);
app.get("/api/patterns/abandoned-ideas", (c) =>
  c.json(detectAbandoned(signals)),
);
app.get("/api/capabilities", (c) => c.json(discoverCapabilities(signals)));
app.get("/api/opportunities", (c) => c.json(opportunities));
app.get("/api/opportunities/:id", (c) => {
  const o = opportunities.find((x) => x.id === c.req.param("id"));
  return o ? c.json(o) : err(c, 404, "NOT_FOUND", "Opportunity not found");
});
app.patch("/api/opportunities/:id", (c) =>
  opportunities.some((x) => x.id === c.req.param("id"))
    ? c.json({ id: c.req.param("id"), updated: true })
    : err(c, 404, "NOT_FOUND", "Opportunity not found"),
);
app.post("/api/opportunities/:id/questions", (c) =>
  c.json(
    {
      questions: [
        "Is this problem top-three urgent?",
        "Who can own a pilot?",
        "What result would invalidate the hypothesis?",
      ],
    },
    201,
  ),
);
app.post("/api/validation-answers", async (c) => {
  const schema = z.object({
    opportunityId: z.string(),
    answer: z.enum(["yes", "no", "unknown"]),
    evidenceType: z.enum(["opinion", "verified_fact"]),
  });
  const r = schema.safeParse(await c.req.json().catch(() => null));
  if (!r.success)
    return err(c, 422, "VALIDATION_ERROR", "Invalid validation answer");
  answers.push(r.data);
  return c.json(r.data, 201);
});
app.post("/api/opportunities/:id/experiments", (c) => {
  const e = {
    id: `e${experiments.length + 1}`,
    opportunityId: c.req.param("id"),
    status: "draft",
  };
  experiments.push(e);
  return c.json(e, 201);
});
app.patch("/api/experiments/:id", (c) =>
  c.json({ id: c.req.param("id"), updated: true }),
);
app.post("/api/outcomes", async (c) => {
  const o = { id: `out${outcomes.length + 1}`, ...(await c.req.json()) };
  outcomes.push(o);
  learnings.push({
    id: `learn${learnings.length + 1}`,
    sourceOutcomeId: o.id,
    lesson: "Update evidence weighting from recorded outcome",
    humanApproved: false,
  });
  return c.json(o, 201);
});
app.get("/api/learnings", (c) => c.json(learnings));
app.all("/api/*", (c) => err(c, 404, "ROUTE_NOT_FOUND", "API route not found"));
app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));
export default app;
