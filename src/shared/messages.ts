import type { ModelStatus, ProofreadResult, RewriteResult, TonePreset } from "./types";

// Request types
export interface ProofreadRequest {
  type: "PROOFREAD";
  text: string;
}

export interface RewriteToneRequest {
  type: "REWRITE_TONE";
  text: string;
  tone: TonePreset;
}

export interface GetModelStatusRequest {
  type: "GET_MODEL_STATUS";
}

export type MessageRequest =
  | ProofreadRequest
  | RewriteToneRequest
  | GetModelStatusRequest;

// Response types
export interface ProofreadResponse {
  success: true;
  result: ProofreadResult;
}

export interface RewriteToneResponse {
  success: true;
  result: RewriteResult;
}

export interface ModelStatusResponse {
  status: ModelStatus;
  error?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export type MessageResponse =
  | ProofreadResponse
  | RewriteToneResponse
  | ModelStatusResponse
  | ErrorResponse;

export function sendMessage<T extends MessageResponse>(
  message: MessageRequest
): Promise<T> {
  return chrome.runtime.sendMessage(message);
}
