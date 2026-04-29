// Local type shim — simple-chromium-ai 0.2.1 ships an empty index.d.ts.
declare module "simple-chromium-ai" {
  type Monitor = (m: EventTarget) => void;

  interface LanguageModelInitOptions {
    expectedInputs?: unknown;
    expectedOutputs?: unknown;
    monitor?: Monitor;
    signal?: AbortSignal;
  }

  interface SessionCreateOptions {
    initialPrompts?: unknown;
    signal?: AbortSignal;
    [key: string]: unknown;
  }

  interface Session {
    prompt(input: string, opts?: unknown): Promise<string>;
    clone(): Promise<Session>;
    destroy(): void;
  }

  interface LanguageModelInstance {
    createSession(opts?: SessionCreateOptions): Promise<Session>;
    prompt(input: string, ...args: unknown[]): Promise<string>;
    withSession<T>(fn: (s: Session) => Promise<T>, opts?: SessionCreateOptions): Promise<T>;
    checkTokenUsage(input: string, opts?: SessionCreateOptions): Promise<unknown>;
  }

  export function initLanguageModel(
    opts?: LanguageModelInitOptions
  ): Promise<LanguageModelInstance>;
}
