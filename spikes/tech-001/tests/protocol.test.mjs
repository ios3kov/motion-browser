import test from "node:test";
import assert from "node:assert/strict";
import {
  SCHEMA_VERSION,
  createPayload,
  normalizeItem,
  validatePayload
} from "../protocol.mjs";

test("creates a valid text payload", () => {
  const payload = createPayload({
    operationId: "op-text-1",
    pageUrl: "https://example.com/page",
    pageTitle: "Example",
    items: [{ id: "headline", kind: "text", text: "Hello AE" }]
  });

  assert.equal(payload.schemaVersion, SCHEMA_VERSION);
  assert.equal(payload.items[0].kind, "text");
  assert.equal(payload.items[0].text, "Hello AE");
  assert.deepEqual(validatePayload(payload), { ok: true, errors: [] });
});

test("creates a valid image payload", () => {
  const payload = createPayload({
    operationId: "op-image-1",
    pageUrl: "https://example.com/page",
    items: [{
      id: "hero",
      kind: "image",
      sourceUrl: "https://example.com/hero.png",
      alt: "Hero",
      width: 1920,
      height: 1080
    }]
  });

  assert.equal(payload.items[0].sourceUrl, "https://example.com/hero.png");
  assert.equal(payload.items[0].width, 1920);
  assert.deepEqual(validatePayload(payload), { ok: true, errors: [] });
});

test("supports batch payloads", () => {
  const payload = createPayload({
    operationId: "op-batch-1",
    pageUrl: "https://example.com/page",
    items: [
      { id: "a", kind: "text", text: "A" },
      { id: "b", kind: "image", sourceUrl: "https://example.com/b.png" }
    ]
  });

  assert.equal(payload.items.length, 2);
  assert.deepEqual(validatePayload(payload), { ok: true, errors: [] });
});

test("rejects unsupported kinds", () => {
  const result = validatePayload({
    schemaVersion: SCHEMA_VERSION,
    operationId: "op-bad-1",
    source: { pageUrl: "https://example.com" },
    items: [{ id: "x", kind: "script" }]
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /kind is unsupported/);
});

test("rejects missing source fields", () => {
  assert.throws(() => {
    createPayload({
      operationId: "op-bad-2",
      pageUrl: "",
      items: [{ id: "x", kind: "text", text: "Hello" }]
    });
  }, /source\.pageUrl is required/);
});

test("normalization keeps only supported image fields", () => {
  const item = normalizeItem({
    id: "img",
    kind: "image",
    sourceUrl: "https://example.com/x.png",
    alt: "X",
    width: 320,
    height: 200,
    arbitrary: "drop-me"
  });

  assert.deepEqual(item, {
    id: "img",
    kind: "image",
    sourceUrl: "https://example.com/x.png",
    alt: "X",
    width: 320,
    height: 200
  });
});
