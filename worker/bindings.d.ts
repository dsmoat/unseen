interface D1Database {}
interface Ai {
  run(model: string, input: unknown): Promise<unknown>;
}
interface VectorizeIndex {}
interface Fetcher {
  fetch(request: Request): Promise<Response>;
}
