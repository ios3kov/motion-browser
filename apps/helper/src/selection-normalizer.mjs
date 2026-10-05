export function normalizeRawSelection(raw) {
  if (!raw || raw.cancelled) return null;

  if (raw.item?.kind === "image") {
    if (!raw.item.sourceUrl) throw new Error("image source URL is missing");
    return {
      pageUrl: String(raw.pageUrl || ""),
      pageTitle: String(raw.pageTitle || ""),
      item: {
        id: String(raw.item.id || "image"),
        kind: "image",
        sourceUrl: String(raw.item.sourceUrl),
        alt: String(raw.item.alt || ""),
        width: Number(raw.item.width || 0),
        height: Number(raw.item.height || 0)
      },
      observedStyle: null
    };
  }

  if (raw.item?.kind === "text") {
    const text = String(raw.item.text || "").trim();
    if (!text) throw new Error("text selection is empty");

    return {
      pageUrl: String(raw.pageUrl || ""),
      pageTitle: String(raw.pageTitle || ""),
      item: {
        id: String(raw.item.id || "text"),
        kind: "text",
        text
      },
      observedStyle: raw.item.observedStyle || null
    };
  }

  throw new Error("unsupported selection kind");
}
