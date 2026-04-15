import { sendMessage } from "../shared/messages";
import type { WarmUpResponse } from "../shared/messages";

type FieldCallback = (field: HTMLElement | null) => void;

const IGNORED_TYPES = new Set(["search", "password", "email", "number", "tel", "url", "date"]);
const MIN_FIELD_HEIGHT = 32;
const MIN_FIELD_WIDTH = 100;

let warmedUp = false;

export function isValidField(el: Element): el is HTMLElement {
  if (el instanceof HTMLTextAreaElement) {
    const rect = el.getBoundingClientRect();
    return rect.height >= MIN_FIELD_HEIGHT && rect.width >= MIN_FIELD_WIDTH;
  }

  if (el instanceof HTMLInputElement) {
    if (IGNORED_TYPES.has(el.type)) return false;
    if (el.type === "text") {
      const rect = el.getBoundingClientRect();
      return rect.height >= MIN_FIELD_HEIGHT && rect.width >= MIN_FIELD_WIDTH;
    }
    return false;
  }

  if (el instanceof HTMLElement && el.isContentEditable) {
    if (el.closest('[role="search"]')) return false;
    const rect = el.getBoundingClientRect();
    return rect.height >= MIN_FIELD_HEIGHT && rect.width >= MIN_FIELD_WIDTH;
  }

  return false;
}

function warmUpModel(): void {
  if (warmedUp) return;
  warmedUp = true;
  sendMessage<WarmUpResponse>({ type: "WARM_UP" }).catch(() => {
    // If service worker isn't ready, that's fine - it'll init on the actual request
    warmedUp = false;
  });
}

export function initFieldDetector(onFieldChange: FieldCallback): void {
  let activeField: HTMLElement | null = null;
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;

  function handleFocusIn(e: FocusEvent): void {
    const target = e.target as Element;
    if (!isValidField(target)) return;

    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    activeField = target;
    onFieldChange(activeField);
  }

  function handleFocusOut(_e: FocusEvent): void {
    // Delay to allow clicking the floating icon
    hideTimeout = setTimeout(() => {
      activeField = null;
      onFieldChange(null);
    }, 200);
  }

  document.addEventListener("focusin", handleFocusIn, true);
  document.addEventListener("focusout", handleFocusOut, true);
  document.addEventListener("input", (e: Event) => {
    const target = e.target as Element;
    if (isValidField(target)) warmUpModel();
  }, true);

  // Also watch for dynamically added contenteditable elements
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          if (isValidField(node) && document.activeElement === node) {
            activeField = node;
            onFieldChange(activeField);
          }
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
