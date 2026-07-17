import { z } from "zod";
import { signals, claims, opportunities } from "../src/data/demo";
import type { Message, Opportunity } from "../src/types";
const SignalSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  sourceMessageIds: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});
const Bundle = z.object({ signals: z.array(SignalSchema) });
export interface IntelligenceService {
  extractSignals(m: Message[]): Promise<unknown[]>;
  extractClaims(m: Message[]): Promise<unknown[]>;
  resolveEntities(s: unknown[], p: unknown[]): Promise<unknown[]>;
  generateOpportunity(p: unknown, c: unknown[]): Promise<Opportunity[]>;
  generateValidationQuestions(o: Opportunity): Promise<string[]>;
  generateExperiment(o: Opportunity, a: unknown[]): Promise<unknown>;
}
export class DeterministicService implements IntelligenceService {
  async extractSignals(_m: Message[]): Promise<unknown[]> {
    return signals;
  }
  async extractClaims(_m: Message[]) {
    return claims;
  }
  async resolveEntities(_s: unknown[], _p: unknown[]) {
    return [];
  }
  async generateOpportunity(_p: unknown, _c: unknown[]) {
    return opportunities;
  }
  async generateValidationQuestions(_o: Opportunity) {
    return [
      "Is the problem top-three urgent?",
      "Who owns a pilot?",
      "What evidence would invalidate this hypothesis?",
    ];
  }
  async generateExperiment(o: Opportunity, _a: unknown[]) {
    return {
      opportunityId: o.id,
      method: "Five interviews followed by a limited concierge pilot",
      durationDays: 14,
    };
  }
}
export class WorkersAIService extends DeterministicService {
  constructor(
    private ai: Ai,
    private model: string,
  ) {
    super();
  }
  private async structured(prompt: string): Promise<unknown[]> {
    const safe = prompt.slice(0, 24000);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r: any = await this.ai.run(this.model, {
          messages: [
            {
              role: "system",
              content:
                "Return only concise JSON with evidence IDs. Never reveal reasoning.",
            },
            { role: "user", content: safe },
          ],
        });
        const parsed = Bundle.safeParse(JSON.parse(r.response));
        if (parsed.success) return parsed.data.signals;
      } catch {
        console.error("Workers AI structured-output failure", { attempt });
      }
    }
    throw new Error("AI_OUTPUT_INVALID");
  }
  async extractSignals(m: Message[]): Promise<unknown[]> {
    return this.structured(
      JSON.stringify(m.map((x) => ({ id: x.id, content: x.content }))),
    );
  }
}
