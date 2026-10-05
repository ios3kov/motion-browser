import test from "node:test";
import assert from "node:assert/strict";
import { normalizeNavigationUrl, isAllowedRemoteUrl } from "../src/navigation.mjs";

test("adds https to bare host", () => {
  assert.equal(normalizeNavigationUrl("example.com"), "https://example.com/");
});

test("allows http and https", () => {
  assert.equal(isAllowedRemoteUrl("https://example.com/x"), true);
  assert.equal(isAllowedRemoteUrl("http://example.com/x"), true);
});

test("blocks privileged and executable URL schemes", () => {
  for (const url of [
    "file:///etc/passwd",
    "javascript:alert(1)",
    "data:text/html,hello",
    "motionbrowser://connect"
  ]) {
    assert.equal(isAllowedRemoteUrl(url), false, url);
  }
});

test("normalize rejects blocked protocols", () => {
  assert.throws(() => normalizeNavigationUrl("file:///tmp/a"), /Blocked URL protocol/);
});
