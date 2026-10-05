import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { findConnectUrl, parseConnectUrl, sessionDirectory } from "../src/session.mjs";

test("parses Motion Browser connect URL", () => {
  const result = parseConnectUrl(
    "motionbrowser://connect?mailbox=%2Ftmp%2Fmotion-browser&session=session_1234567890"
  );
  assert.equal(result.mailboxPath, path.resolve("/tmp/motion-browser"));
  assert.equal(result.sessionId, "session_1234567890");
});

test("finds connect URL in argv", () => {
  assert.equal(
    findConnectUrl(["electron", ".", "motionbrowser://connect?x=1"]),
    "motionbrowser://connect?x=1"
  );
});

test("rejects wrong scheme and unsafe session ids", () => {
  assert.throws(
    () => parseConnectUrl("https://connect?mailbox=/tmp/x&session=session_1234567890"),
    /Unsupported/
  );
  assert.throws(
    () => parseConnectUrl("motionbrowser://connect?mailbox=/tmp/x&session=..%2F..%2Fx"),
    /invalid session id/
  );
});

test("session directory remains inside mailbox", () => {
  const result = sessionDirectory("/tmp/mb", "session_1234567890");
  assert.equal(result, path.resolve("/tmp/mb/sessions/session_1234567890"));
});
