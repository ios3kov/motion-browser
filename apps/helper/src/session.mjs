import path from "node:path";

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{12,128}$/;

export function parseConnectUrl(input) {
  let url;
  try {
    url = new URL(String(input));
  } catch {
    throw new Error("Invalid Motion Browser connect URL");
  }

  if (url.protocol !== "motionbrowser:" || url.hostname !== "connect") {
    throw new Error("Unsupported Motion Browser URL");
  }

  const mailbox = url.searchParams.get("mailbox");
  const sessionId = url.searchParams.get("session");

  if (!mailbox) throw new Error("mailbox is required");
  if (!SESSION_ID_PATTERN.test(String(sessionId || ""))) {
    throw new Error("invalid session id");
  }

  return {
    mailboxPath: path.resolve(mailbox),
    sessionId
  };
}

export function findConnectUrl(argv = []) {
  return argv.find((value) => String(value).startsWith("motionbrowser://connect?")) || null;
}

export function sessionDirectory(mailboxPath, sessionId) {
  if (!SESSION_ID_PATTERN.test(String(sessionId || ""))) {
    throw new Error("invalid session id");
  }

  const mailbox = path.resolve(mailboxPath);
  const target = path.resolve(mailbox, "sessions", sessionId);
  const relative = path.relative(mailbox, target);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("session path escapes mailbox");
  }

  return target;
}
