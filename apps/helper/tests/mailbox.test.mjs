import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import {
  connectMailbox,
  writeEvent,
  writeHelperReady
} from "../src/mailbox.mjs";

test("connects only to a valid session and writes atomic event envelopes", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "motion-browser-"));
  const sessionId = "session_1234567890";
  const sessionRoot = path.join(root, "sessions", sessionId);
  const token = "abcdefghijklmnopqrstuvwxyz_1234567890";

  try {
    await mkdir(sessionRoot, { recursive: true });
    await writeFile(
      path.join(sessionRoot, "session.json"),
      JSON.stringify({
        protocolVersion: 1,
        sessionId,
        sessionToken: token
      }),
      "utf8"
    );

    const session = await connectMailbox(root, sessionId);
    const readyPath = await writeHelperReady(session, "0.0.1");
    const result = await writeEvent(session, "selection.ready", {
      selection: { schemaVersion: 1 }
    });

    const ready = JSON.parse(await readFile(readyPath, "utf8"));
    const event = JSON.parse(await readFile(result.eventPath, "utf8"));

    assert.equal(ready.sessionId, sessionId);
    assert.equal(event.type, "selection.ready");
    assert.equal(event.sessionToken, token);
    assert.equal(event.sessionId, sessionId);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects protocol mismatch", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "motion-browser-"));
  const sessionId = "session_1234567890";
  const sessionRoot = path.join(root, "sessions", sessionId);

  try {
    await mkdir(sessionRoot, { recursive: true });
    await writeFile(
      path.join(sessionRoot, "session.json"),
      JSON.stringify({
        protocolVersion: 999,
        sessionId,
        sessionToken: "abcdefghijklmnopqrstuvwxyz_1234567890"
      }),
      "utf8"
    );

    await assert.rejects(
      () => connectMailbox(root, sessionId),
      /unsupported IPC protocol version/
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
