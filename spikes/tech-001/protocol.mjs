export const SCHEMA_VERSION = 1;

const ALLOWED_KINDS = new Set(["text", "image"]);

export function makeOperationId(prefix = "mb") {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${random}`;
}

export function createPayload({ operationId, pageUrl, pageTitle = "", items }) {
  const payload = {
    schemaVersion: SCHEMA_VERSION,
    operationId: operationId || makeOperationId(),
    source: {
      pageUrl: String(pageUrl || ""),
      pageTitle: String(pageTitle || "")
    },
    items: Array.isArray(items) ? items.map(normalizeItem) : []
  };

  const result = validatePayload(payload);
  if (!result.ok) {
    throw new Error(`Invalid Motion Browser payload: ${result.errors.join("; ")}`);
  }

  return payload;
}

export function normalizeItem(item, index = 0) {
  const kind = String(item?.kind || "");
  const normalized = {
    id: String(item?.id || `item-${index + 1}`),
    kind
  };

  if (kind === "text") {
    normalized.text = String(item?.text || "");
  }

  if (kind === "image") {
    normalized.sourceUrl = String(item?.sourceUrl || "");
    if (item?.alt != null) normalized.alt = String(item.alt);
    if (Number.isFinite(item?.width)) normalized.width = Number(item.width);
    if (Number.isFinite(item?.height)) normalized.height = Number(item.height);
  }

  return normalized;
}

export function validatePayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["payload must be an object"] };
  }

  if (payload.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${SCHEMA_VERSION}`);
  }

  if (typeof payload.operationId !== "string" || payload.operationId.trim() === "") {
    errors.push("operationId is required");
  }

  if (!payload.source || typeof payload.source.pageUrl !== "string" || payload.source.pageUrl.trim() === "") {
    errors.push("source.pageUrl is required");
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push("items must contain at least one selection");
  } else {
    payload.items.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        errors.push(`items[${index}] must be an object`);
        return;
      }

      if (typeof item.id !== "string" || item.id.trim() === "") {
        errors.push(`items[${index}].id is required`);
      }

      if (!ALLOWED_KINDS.has(item.kind)) {
        errors.push(`items[${index}].kind is unsupported`);
        return;
      }

      if (item.kind === "text" && (typeof item.text !== "string" || item.text.trim() === "")) {
        errors.push(`items[${index}].text is required`);
      }

      if (item.kind === "image" && (typeof item.sourceUrl !== "string" || item.sourceUrl.trim() === "")) {
        errors.push(`items[${index}].sourceUrl is required`);
      }
    });
  }

  return { ok: errors.length === 0, errors };
}

export function extractSupportedElement(element, pageUrl) {
  if (!element || !element.tagName) {
    throw new Error("Expected a DOM element");
  }

  const tagName = String(element.tagName).toUpperCase();

  if (tagName === "IMG") {
    return normalizeItem({
      id: element.id || undefined,
      kind: "image",
      sourceUrl: new URL(element.currentSrc || element.src, pageUrl).href,
      alt: element.alt || "",
      width: Number(element.naturalWidth || element.width || 0),
      height: Number(element.naturalHeight || element.height || 0)
    });
  }

  const text = String(element.innerText || element.textContent || "").trim();
  if (text) {
    return normalizeItem({
      id: element.id || undefined,
      kind: "text",
      text
    });
  }

  throw new Error(`Unsupported element: ${tagName}`);
}
