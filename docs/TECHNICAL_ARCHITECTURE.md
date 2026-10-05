# Motion Browser — Technical Architecture

Status: adopted direction, implementation in progress  
Date: 2026-10-05  
Decision source: user explicitly chose browser helper architecture.  
Standard: AE Development Rules v8.0.0  
Risk Profile: Critical — browser security + local IPC + external content + future packaging.

## 1. Architecture decision

Motion Browser will use two cooperating components:

### A. After Effects plugin
Primary responsibilities:
- AE panel/workflow;
- connect to the local helper;
- receive validated selection payloads;
- persist/import media;
- create AE layers/keyframes;
- show progress/errors/recovery state.

Target runtime: UXP when the required After Effects host runtime is available and verified.

### B. Browser Helper
Primary responsibilities:
- own the browsing session;
- render arbitrary websites in Chromium;
- inspect DOM, CSS and supported animation state;
- provide element-selection UX;
- download/capture assets when allowed;
- normalize selected content into the Motion Browser protocol;
- never expose native/Node capability to loaded remote pages.

Initial implementation technology: Electron/Chromium.

## 2. Why helper-first

The product requires inspection of arbitrary third-party pages.

Electron exposes controlled page execution through `webContents.executeJavaScript` and `executeJavaScriptInIsolatedWorld`, while its security model allows remote content to run with Node integration disabled, context isolation enabled and sandboxing enabled.

This makes the browser capability a component we control instead of depending on an unproven AE WebView injection capability.

## 3. Trust boundaries

```
Remote website (untrusted)
        |
        v
Sandboxed Chromium webContents
        |
        | isolated extraction code
        v
Browser Helper main process
        |
        | validated Motion Browser protocol
        | authenticated local IPC
        v
AE UXP plugin
        |
        | validated host mutation
        v
After Effects project
```

Remote web content is always untrusted.

It must never receive:
- Node integration;
- filesystem APIs;
- process APIs;
- helper IPC credentials;
- AE mutation APIs;
- arbitrary local IPC access.

## 4. Browser security baseline

Every remote browsing surface MUST use:
- `nodeIntegration: false`;
- `contextIsolation: true`;
- `sandbox: true`;
- no dangerous generic preload bridge exposed to page JS;
- denied/controlled `window.open`;
- explicit navigation policy;
- explicit permission-request policy;
- external protocol allowlist;
- isolated-world extraction where practical.

No website-supplied string is executed as privileged code.

## 5. Extraction model

The helper injects our own fixed extraction/selection code into an isolated world.

Supported v1 normalized types:
- text;
- image;
- SVG;
- video;
- audio;
- color;
- simple gradient;
- Lottie;
- reference capture.

Animation conversion uses capability classification:
- editable-supported;
- capture-fallback;
- unsupported.

The helper reports what it can prove. It does not claim editability for unknown animation mechanisms.

## 6. Local IPC

Direction:
- helper hosts the local service;
- UXP is a client;
- persistent WebSocket is preferred for events/selections;
- request/response messages carry an operation/correlation ID.

Security requirements:
- bind to loopback only;
- random per-session authentication token;
- protocol version handshake;
- helper process/session identity;
- reject unauthenticated clients;
- message schema validation;
- maximum message sizes;
- timeout/cancellation;
- explicit outcome states for mutating requests;
- no listening on LAN interfaces.

The final transport details remain implementation-tested because UXP host behavior must be verified in After Effects.

## 7. Data ownership

Helper may download/capture temporary source data.

Before AE project mutation:
- asset identity and source URL are known;
- persistent destination strategy is selected;
- partial downloads are not treated as complete assets;
- temp storage is not the only copy of user-required media.

## 8. Failure model

Each operation has:
- operationId;
- state;
- per-item result;
- explicit failure;
- cancellation state;
- unknown-outcome state where applicable.

Batch processing must not hide partial failure.

A dropped IPC response after an AE mutation does not automatically mean the mutation failed. Reconciliation is required before retry.

## 9. Initial milestones

### M1 — Helper core
- secure Chromium window;
- controlled page navigation;
- isolated selection injection;
- text/image extraction;
- normalized payload;
- local protocol tests.

### M2 — Helper IPC
- loopback authenticated WebSocket;
- handshake/versioning;
- reconnect and timeout semantics;
- malformed/unauthorized request tests.

### M3 — AE bridge
- UXP client;
- helper discovery/start/connect;
- text → Text Layer;
- image → persistent file + import;
- Undo/recovery contract.

### M4 — v1 format expansion
- SVG;
- video/audio;
- colors/gradients;
- reference capture;
- Lottie;
- batch UX.

### M5 — supported animation mapping
- capability detector;
- simple animation → keyframes;
- capture fallback;
- explicit unsupported state.

## 10. Architecture gate

This architecture is adopted.

The remaining runtime question is no longer whether the helper is needed. It is only the exact verified AE UXP integration contract and supported host versions.

No CEP dependency is introduced as the primary architecture.
