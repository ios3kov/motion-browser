new Promise((resolve) => {
  const marker = "data-motion-browser-overlay";
  document.querySelectorAll("[" + marker + "]").forEach((node) => node.remove());

  const overlay = document.createElement("div");
  overlay.setAttribute(marker, "true");
  Object.assign(overlay.style, {
    position: "fixed",
    pointerEvents: "none",
    zIndex: "2147483647",
    border: "2px solid rgb(79, 140, 255)",
    background: "rgba(79, 140, 255, 0.08)",
    boxSizing: "border-box",
    display: "none"
  });
  document.documentElement.appendChild(overlay);

  let current = null;

  function cleanup() {
    document.removeEventListener("mousemove", onMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKey, true);
    overlay.remove();
  }

  function onMove(event) {
    if (!(event.target instanceof Element) || event.target === overlay) return;
    current = event.target;
    const rect = current.getBoundingClientRect();
    Object.assign(overlay.style, {
      display: "block",
      left: rect.left + "px",
      top: rect.top + "px",
      width: Math.max(0, rect.width) + "px",
      height: Math.max(0, rect.height) + "px"
    });
  }

  function onKey(event) {
    if (event.key !== "Escape") return;
    cleanup();
    resolve({ cancelled: true });
  }

  function onClick(event) {
    const target = current || event.target;
    if (!(target instanceof Element) || target === overlay) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const image = target.closest("img");
    let item;

    if (image) {
      item = {
        id: image.id || "",
        kind: "image",
        sourceUrl: String(image.currentSrc || image.src || "").slice(0, 16384),
        alt: String(image.alt || "").slice(0, 4096),
        width: Number(image.naturalWidth || image.width || 0),
        height: Number(image.naturalHeight || image.height || 0)
      };
    } else {
      const text = String(target.innerText || target.textContent || "").trim().slice(0, 20000);
      if (!text) return;
      const style = getComputedStyle(target);
      item = {
        id: target.id || "",
        kind: "text",
        text,
        observedStyle: {
          color: String(style.color || ""),
          backgroundColor: String(style.backgroundColor || ""),
          backgroundImage: String(style.backgroundImage || ""),
          fontFamily: String(style.fontFamily || ""),
          fontSize: String(style.fontSize || ""),
          fontWeight: String(style.fontWeight || "")
        }
      };
    }

    cleanup();
    resolve({
      cancelled: false,
      pageUrl: location.href,
      pageTitle: document.title,
      item
    });
  }

  document.addEventListener("mousemove", onMove, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKey, true);
});
