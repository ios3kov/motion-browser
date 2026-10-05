const { shell } = require("uxp");
const { localFileSystem } = require("uxp").storage;

const IPC_PROTOCOL_VERSION = 1;

function randomHex(byteCount) {
  const bytes = new Uint8Array(byteCount);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

async function getOrCreateFolder(parent, name) {
  try {
    const existing = await parent.getEntry(name);
    if (!existing.isFolder) {
      throw new Error(`${name} exists but is not a folder`);
    }
    return existing;
  } catch (error) {
    if (String(error.message || error).includes("is not a folder")) throw error;
    return parent.createFolder(name);
  }
}

async function createSession() {
  const dataFolder = await localFileSystem.getDataFolder();
  const sessionsFolder = await getOrCreateFolder(dataFolder, "sessions");

  const sessionId = `session_${crypto.randomUUID().replace(/-/g, "")}`;
  const sessionToken = randomHex(32);
  const sessionFolder = await sessionsFolder.createFolder(sessionId);
  await sessionFolder.createFolder("events");

  const sessionFile = await sessionFolder.createFile("session.json", {
    overwrite: false
  });

  await sessionFile.write(
    JSON.stringify(
      {
        protocolVersion: IPC_PROTOCOL_VERSION,
        sessionId,
        sessionToken,
        createdAt: new Date().toISOString()
      },
      null,
      2
    )
  );

  return {
    protocolVersion: IPC_PROTOCOL_VERSION,
    sessionId,
    sessionToken,
    dataFolder,
    sessionFolder,
    mailboxPath: dataFolder.nativePath
  };
}

async function launchHelper(session) {
  const connectUrl =
    "motionbrowser://connect" +
    `?mailbox=${encodeURIComponent(session.mailboxPath)}` +
    `&session=${encodeURIComponent(session.sessionId)}`;

  const result = await shell.openExternal(
    connectUrl,
    "Opening Motion Browser to select web content for After Effects"
  );

  if (result !== "") {
    throw new Error(`Motion Browser helper launch failed: ${result}`);
  }

  return connectUrl;
}

async function waitForHelperReady(session, options = {}) {
  const timeoutMs = Number(options.timeoutMs || 10000);
  const pollMs = Number(options.pollMs || 200);
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const readyFile = await session.sessionFolder.getEntry("helper-ready.json");
      const ready = JSON.parse(await readyFile.read());

      if (
        ready.protocolVersion === IPC_PROTOCOL_VERSION &&
        ready.sessionId === session.sessionId &&
        ready.sessionToken === session.sessionToken
      ) {
        return ready;
      }
    } catch {
      // Not ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }

  throw new Error("Motion Browser helper did not become ready in time");
}

async function readPendingEvents(session, seenEventIds = new Set()) {
  const eventsFolder = await session.sessionFolder.getEntry("events");
  const entries = await eventsFolder.getEntries();
  const events = [];

  for (const entry of entries) {
    if (!entry.isFile || !entry.name.endsWith(".json")) continue;

    const envelope = JSON.parse(await entry.read());

    if (seenEventIds.has(envelope.eventId)) continue;
    if (envelope.protocolVersion !== IPC_PROTOCOL_VERSION) continue;
    if (envelope.sessionId !== session.sessionId) continue;
    if (envelope.sessionToken !== session.sessionToken) continue;

    events.push(envelope);
  }

  events.sort((a, b) => String(a.eventId).localeCompare(String(b.eventId)));
  return events;
}

module.exports = {
  IPC_PROTOCOL_VERSION,
  createSession,
  launchHelper,
  waitForHelperReady,
  readPendingEvents
};
