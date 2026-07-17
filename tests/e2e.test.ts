import { it, expect } from "vitest";
import app from "../worker/index";
const env = { ASSETS: { fetch: () => new Response("asset") } } as any;
const req = (path: string, method = "GET", body?: unknown) =>
  app.request(
    path,
    {
      method,
      headers: { "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    },
    env,
  );
it("runs the complete learning loop", async () => {
  expect(
    ((await (await req("/api/demo/load", "POST")).json()) as any).loaded,
  ).toBe(true);
  expect(
    ((await (await req("/api/pipeline/run", "POST")).json()) as any).status,
  ).toBe("completed");
  expect(
    ((await (await req("/api/patterns/contradictions")).json()) as any[])[0]
      .claims,
  ).toHaveLength(3);
  expect((await req("/api/opportunities/o2")).status).toBe(200);
  expect(
    (
      await req("/api/validation-answers", "POST", {
        opportunityId: "o2",
        answer: "yes",
        evidenceType: "verified_fact",
      })
    ).status,
  ).toBe(201);
  expect((await req("/api/opportunities/o2/experiments", "POST")).status).toBe(
    201,
  );
  expect(
    (
      await req("/api/outcomes", "POST", {
        result: "confirmed",
        evidence: "interview",
      })
    ).status,
  ).toBe(201);
  expect((await (await req("/api/learnings")).json()) as any[]).toHaveLength(1);
});
