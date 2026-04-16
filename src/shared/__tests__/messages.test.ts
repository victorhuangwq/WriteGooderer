import { describe, it, expect, beforeEach } from "vitest";
import { chrome } from "vitest-chrome";
import { sendMessage } from "../messages";

describe("sendMessage", () => {
  beforeEach(() => {
    chrome.runtime.sendMessage.mockReset();
  });

  it("sends a PROOFREAD message with text", async () => {
    const mockResult = {
      success: true,
      result: {
        corrected: "Hello world",
        changes: [],
        score: 95,
        tier: "Shakespeare Who?",
      },
    };
    chrome.runtime.sendMessage.mockImplementation(() =>
      Promise.resolve(mockResult) as any
    );

    const response = await sendMessage({
      type: "PROOFREAD",
      text: "Hello world",
    });
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: "PROOFREAD",
      text: "Hello world",
    });
    expect(response).toEqual(mockResult);
  });

  it("sends a REWRITE_TONE message with text and tone", async () => {
    chrome.runtime.sendMessage.mockImplementation(() =>
      Promise.resolve({ success: true, result: { rewritten: "Yo!" } }) as any
    );

    await sendMessage({
      type: "REWRITE_TONE",
      text: "Hello",
      tone: "casual",
    });
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: "REWRITE_TONE",
      text: "Hello",
      tone: "casual",
    });
  });

  it("sends a GET_MODEL_STATUS message", async () => {
    chrome.runtime.sendMessage.mockImplementation(() =>
      Promise.resolve({ status: "loading" }) as any
    );

    const response = await sendMessage({ type: "GET_MODEL_STATUS" });
    expect(response).toEqual({ status: "loading" });
  });
});
