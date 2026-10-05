import test from "node:test";
import assert from "node:assert/strict";
import {
  REMOTE_WEB_PREFERENCES,
  SECURITY_POLICY
} from "../src/security.mjs";

test("remote content has no Node/native bridge", () => {
  assert.equal(REMOTE_WEB_PREFERENCES.nodeIntegration, false);
  assert.equal(REMOTE_WEB_PREFERENCES.contextIsolation, true);
  assert.equal(REMOTE_WEB_PREFERENCES.sandbox, true);
  assert.equal(REMOTE_WEB_PREFERENCES.webSecurity, true);
  assert.equal(REMOTE_WEB_PREFERENCES.allowRunningInsecureContent, false);
  assert.equal(REMOTE_WEB_PREFERENCES.webviewTag, false);
  assert.equal(SECURITY_POLICY.allowRemoteNode, false);
  assert.equal(SECURITY_POLICY.allowRemotePreloadBridge, false);
});
