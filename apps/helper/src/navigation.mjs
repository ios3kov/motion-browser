const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export function normalizeNavigationUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) throw new Error("URL is required");

  const candidate = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(raw)
    ? raw
    : `https://${raw}`;

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("Invalid URL");
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new Error(`Blocked URL protocol: ${parsed.protocol}`);
  }

  return parsed.href;
}

export function isAllowedRemoteUrl(input) {
  try {
    const parsed = new URL(String(input));
    return ALLOWED_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}
