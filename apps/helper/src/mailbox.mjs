import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  mkdir,
  readFile,
  rename,
  stat,
  writeFile
} from "node:fs/promises";
import { sessionDirectory } from "./session.mjs";

export const IPC_PROTOCOL_VERSION = 1;
const MAX_SESSION_FILE_BYTES = 16 * 1024;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{24,256}$/;

function assertInside(basePath, targetPath) {
  const base = path.resolve(basePath);
  const target = path.resolve(targetPath);
  const relative = path.relative(base, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("path escapes mailbox");
  }
  return target;
}

async function readJsonLimited(filePath, maxBytes) {
  const info = await stat(filePath);
  if (!info.isFile()) throw new Error("expected a file");
  if (info.size > maxBytes) throw new Error("file exceeds size limit");
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function connectMailbox(mailboxPath, sessionId) {
  const sessionRoot = sessionDirectory(mailboxPath, sessionId);
  const handshakePath = assertInside(
    sessionRoot,
    path.join(sessionRoot, "session.json")
  );

  const handshake = await readJsonLimited(
    handshakePath,
    MAX_SESSION_FILE_BYTES
  );

  if (handshake.protocolVersion !== IPC_PROTOCOL_VERSION) {
    throw new Error("unsupported IPC protocol version");
  }
  if (handshake.sessionId !== sessionId) {
    throw new Error("session id mismatch");
  }
  if (!TOKEN_PATTERN.test(String(handshake.sessionToken || ""))) {
    throw new Error("invalid session token");
  }

  const eventsPath = assertInside(
    sessionRoot,
    path.join(sessionRoot, "events")
  );
  await mkdir(eventsPath, { recursive: true });

  return {
    mailboxPath: path.resolve(mailboxPath),
    sessionId,
    sessionToken: handshake.sessionToken,
    sessionRoot,
    eventsPath
  };
}

async function atomicWriteJson(filePath, value) {
  const folder = path.dirname(filePath);
  await mkdir(folder, { recursive: true });

  const tempPath = path.join(
    folder,
    `.${path.basename(filePath)}.${randomUUID()}.tmp`
  );

  await writeFile(tempPath, JSON.stringify(value, null, 2), {
    encoding: "utf8",
    flag: "wx"
  });
  await rename(tempPath, filePath);
}

export async function writeEvent(session, type, payload) {
  if (!session?.eventsPath || !session?.sessionToken) {
    throw new Error("active mailbox session is required");
  }

  const eventId = `${Date.now()}-${randomUUID()}`;
  const envelope = {
    protocolVersion: IPC_PROTOCOL_VERSION,
    eventId,
    sessionId: session.sessionId,
    sessionToken: session.sessionToken,
    type: String(type),
    createdAt: new Date().toISOString(),
    payload
  };

  const eventPath = assertInside(
    session.eventsPath,
    path.join(session.eventsPath, `${eventId}.json`)
  );

  await atomicWriteJson(eventPath, envelope);
  return { eventId, eventPath, envelope };
}

export async function writeHelperReady(session, helperVersion) {
  const readyPath = assertInside(
    session.sessionRoot,
    path.join(session.sessionRoot, "helper-ready.json")
  );

  await atomicWriteJson(readyPath, {
    protocolVersion: IPC_PROTOCOL_VERSION,
    sessionId: session.sessionId,
    sessionToken: session.sessionToken,
    helperVersion: String(helperVersion),
    pid: process.pid,
    createdAt: new Date().toISOString()
  });

  return readyPath;
}
