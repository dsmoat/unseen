import { describe, it, expect } from "vitest";
import app from "../worker/index";
const env = { ASSETS: { fetch: () => new Response("asset") } } as any;
describe("API errors", () => {
  it("returns typed 404", async () => {
    const r = await app.request("/api/conversations/missing", {}, env);
    expect(r.status).toBe(404);
    expect(((await r.json()) as any).error.code).toBe("NOT_FOUND");
  });
  it("rejects malformed validation answers", async () => {
    const r = await app.request(
      "/api/validation-answers",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      },
      env,
    );
    expect(r.status).toBe(422);
  });
});
