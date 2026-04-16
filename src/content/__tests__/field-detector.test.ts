import { describe, it, expect, vi } from "vitest";
import { ensureFieldId, isValidField } from "../field-detector";

function mockBoundingRect(
  el: Element,
  width: number,
  height: number
): void {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

describe("isValidField", () => {
  describe("textarea elements", () => {
    it("accepts a textarea with sufficient size", () => {
      const el = document.createElement("textarea");
      mockBoundingRect(el, 200, 50);
      expect(isValidField(el)).toBe(true);
    });

    it("rejects a textarea that is too short", () => {
      const el = document.createElement("textarea");
      mockBoundingRect(el, 200, 20);
      expect(isValidField(el)).toBe(false);
    });

    it("rejects a textarea that is too narrow", () => {
      const el = document.createElement("textarea");
      mockBoundingRect(el, 80, 50);
      expect(isValidField(el)).toBe(false);
    });
  });

  describe("input elements", () => {
    it("rejects search inputs regardless of size", () => {
      const el = document.createElement("input");
      el.type = "search";
      mockBoundingRect(el, 300, 40);
      expect(isValidField(el)).toBe(false);
    });

    it("rejects password inputs", () => {
      const el = document.createElement("input");
      el.type = "password";
      mockBoundingRect(el, 300, 40);
      expect(isValidField(el)).toBe(false);
    });

    it("rejects email inputs", () => {
      const el = document.createElement("input");
      el.type = "email";
      mockBoundingRect(el, 300, 40);
      expect(isValidField(el)).toBe(false);
    });

    it("rejects number inputs", () => {
      const el = document.createElement("input");
      el.type = "number";
      mockBoundingRect(el, 300, 40);
      expect(isValidField(el)).toBe(false);
    });

    it("rejects tel inputs", () => {
      const el = document.createElement("input");
      el.type = "tel";
      mockBoundingRect(el, 300, 40);
      expect(isValidField(el)).toBe(false);
    });

    it("rejects url inputs", () => {
      const el = document.createElement("input");
      el.type = "url";
      mockBoundingRect(el, 300, 40);
      expect(isValidField(el)).toBe(false);
    });

    it("rejects date inputs", () => {
      const el = document.createElement("input");
      el.type = "date";
      mockBoundingRect(el, 300, 40);
      expect(isValidField(el)).toBe(false);
    });

    it("accepts a text input with sufficient size", () => {
      const el = document.createElement("input");
      el.type = "text";
      mockBoundingRect(el, 200, 40);
      expect(isValidField(el)).toBe(true);
    });

    it("rejects a text input that is too small", () => {
      const el = document.createElement("input");
      el.type = "text";
      mockBoundingRect(el, 80, 20);
      expect(isValidField(el)).toBe(false);
    });
  });

  describe("contenteditable elements", () => {
    // jsdom requires contenteditable elements to be in the DOM
    // for isContentEditable to return true
    // jsdom doesn't fully implement isContentEditable, so we mock it
    function makeContentEditable(el: HTMLElement): void {
      el.contentEditable = "true";
      Object.defineProperty(el, "isContentEditable", { value: true, writable: true });
    }

    it("accepts a contenteditable div with sufficient size", () => {
      const el = document.createElement("div");
      makeContentEditable(el);
      mockBoundingRect(el, 300, 100);
      expect(isValidField(el)).toBe(true);
    });

    it("rejects a contenteditable div that is too small", () => {
      const el = document.createElement("div");
      makeContentEditable(el);
      mockBoundingRect(el, 50, 20);
      expect(isValidField(el)).toBe(false);
    });

    it("rejects a contenteditable inside a search role", () => {
      const searchContainer = document.createElement("div");
      searchContainer.setAttribute("role", "search");
      const el = document.createElement("div");
      makeContentEditable(el);
      searchContainer.appendChild(el);
      document.body.appendChild(searchContainer);
      mockBoundingRect(el, 300, 100);
      expect(isValidField(el)).toBe(false);
      document.body.removeChild(searchContainer);
    });
  });

  describe("other elements", () => {
    it("rejects a plain div", () => {
      const el = document.createElement("div");
      mockBoundingRect(el, 300, 100);
      expect(isValidField(el)).toBe(false);
    });

    it("rejects a span", () => {
      const el = document.createElement("span");
      mockBoundingRect(el, 300, 100);
      expect(isValidField(el)).toBe(false);
    });

    it("rejects a button", () => {
      const el = document.createElement("button");
      mockBoundingRect(el, 300, 100);
      expect(isValidField(el)).toBe(false);
    });
  });
});

describe("ensureFieldId", () => {
  it("assigns a stable id to a field", () => {
    const el = document.createElement("textarea");

    const firstId = ensureFieldId(el);
    const secondId = ensureFieldId(el);

    expect(firstId).toMatch(/^wg-field-\d+$/);
    expect(secondId).toBe(firstId);
    expect(el.dataset.wgFieldId).toBe(firstId);
  });

  it("reuses an existing field id", () => {
    const el = document.createElement("textarea");
    el.dataset.wgFieldId = "wg-field-existing";

    expect(ensureFieldId(el)).toBe("wg-field-existing");
  });
});
