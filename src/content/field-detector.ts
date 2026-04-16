type FieldCallback = (field: HTMLElement | null) => void;
type ValidFieldCallback = () => void;

const IGNORED_TYPES = new Set(["search", "password", "email", "number", "tel", "url", "date"]);
const MIN_FIELD_HEIGHT = 32;
const MIN_FIELD_WIDTH = 100;
const FIELD_SELECTOR = 'textarea, input, [contenteditable="true"], [contenteditable="plaintext-only"]';

let nextFieldId = 1;

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

export function ensureFieldId(field: HTMLElement): string {
  const existingId = field.dataset.wgFieldId;
  if (existingId) return existingId;

  const fieldId = `wg-field-${nextFieldId++}`;
  field.dataset.wgFieldId = fieldId;
  return fieldId;
}

function tagFieldIfValid(el: Element): void {
  if (!isValidField(el)) return;
  ensureFieldId(el);
}

function tagFieldsInSubtree(root: ParentNode): void {
  if (root instanceof Element) {
    tagFieldIfValid(root);
  }

  if (!("querySelectorAll" in root)) return;

  for (const el of root.querySelectorAll(FIELD_SELECTOR)) {
    tagFieldIfValid(el);
  }
}

export function initFieldDetector(
  onFieldChange: FieldCallback,
  onValidFieldDetected: ValidFieldCallback = () => {}
): void {
  let activeField: HTMLElement | null = null;
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;
  let hasReportedValidField = false;

  function reportValidField(): void {
    if (hasReportedValidField) return;
    hasReportedValidField = true;
    onValidFieldDetected();
  }

  function registerValidField(field: HTMLElement): void {
    ensureFieldId(field);
    reportValidField();
  }

  function handleFocusIn(e: FocusEvent): void {
    const target = e.target as Element;
    if (!isValidField(target)) return;

    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    registerValidField(target);
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

  tagFieldsInSubtree(document);
  if (hasValidFieldsInSubtree(document)) {
    reportValidField();
  }

  // Watch for dynamically added contenteditable elements
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element || node instanceof DocumentFragment) {
          tagFieldsInSubtree(node);
          if (hasValidFieldsInSubtree(node)) {
            reportValidField();
          }
        }

        if (node instanceof HTMLElement) {
          if (isValidField(node) && document.activeElement === node) {
            registerValidField(node);
            activeField = node;
            onFieldChange(activeField);
          }
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function hasValidFieldsInSubtree(root: ParentNode): boolean {
  if (root instanceof Element && isValidField(root)) {
    return true;
  }

  if (!("querySelectorAll" in root)) return false;

  for (const el of root.querySelectorAll(FIELD_SELECTOR)) {
    if (isValidField(el)) {
      return true;
    }
  }

  return false;
}
