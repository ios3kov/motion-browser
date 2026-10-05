import { createPayload, extractSupportedElement } from "../protocol.mjs";

const selected = new Map();
const status = document.querySelector("#status");
const sendButton = document.querySelector("#send");

function keyFor(element) {
  return element.id || `${element.tagName.toLowerCase()}-${selected.size + 1}`;
}

function toggleSelection(element) {
  const key = keyFor(element);
  if (selected.has(key)) {
    selected.delete(key);
    element.classList.remove("selected");
  } else {
    selected.set(key, element);
    element.classList.add("selected");
  }

  status.textContent = `${selected.size} selected`;
  sendButton.disabled = selected.size === 0;
}

document.querySelectorAll("[data-motion-browser-selectable]").forEach((element) => {
  element.addEventListener("click", (event) => {
    event.preventDefault();
    toggleSelection(element);
  });
});

sendButton.addEventListener("click", () => {
  try {
    const items = [...selected.values()].map((element) =>
      extractSupportedElement(element, window.location.href)
    );

    const payload = createPayload({
      pageUrl: window.location.href,
      pageTitle: document.title,
      items
    });

    if (window.uxpHost?.postMessage) {
      window.uxpHost.postMessage({
        type: "motion-browser.selection",
        payload
      });
      status.textContent = `sent ${items.length} item(s) to UXP host`;
      return;
    }

    console.log("Motion Browser TECH-001 payload", payload);
    status.textContent = "UXP bridge unavailable; payload written to console";
  } catch (error) {
    console.error(error);
    status.textContent = `error: ${error.message}`;
  }
});
