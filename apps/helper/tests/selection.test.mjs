import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { normalizeRawSelection } from "../src/selection-normalizer.mjs";

test("normalizes text selection", () => {
  const value = normalizeRawSelection({
    cancelled: false,
    pageUrl: "https://example.com",
    pageTitle: "Example",
    item: {
      id: "headline",
      kind: "text",
      text: "Hello",
      observedStyle: { color: "rgb(1, 2, 3)" }
    }
  });

  assert.equal(value.item.kind, "text");
  assert.equal(value.item.text, "Hello");
  assert.equal(value.observedStyle.color, "rgb(1, 2, 3)");
});

test("normalizes image selection", () => {
  const value = normalizeRawSelection({
    cancelled: false,
    pageUrl: "https://example.com",
    item: {
      id: "hero",
      kind: "image",
      sourceUrl: "https://example.com/hero.png",
      width: 640,
      height: 480
    }
  });

  assert.equal(value.item.kind, "image");
  assert.equal(value.item.sourceUrl, "https://example.com/hero.png");
});

test("cancel returns null", () => {
  assert.equal(normalizeRawSelection({ cancelled: true }), null);
});

test("fixed selector source contains no Node/Electron bridge", async () => {
  const source = await readFile(
    new URL("../injected/selector.js", import.meta.url),
    "utf8"
  );

  assert.equal(/\brequire\s*\(/.test(source), false);
  assert.equal(/\bprocess\b/.test(source), false);
  assert.equal(/\belectron\b/i.test(source), false);
});
