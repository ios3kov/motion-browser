# Motion Browser — Technical Architecture

Status: adopted direction, implementation in progress  
Date: 2026-10-05  
Decision source: user explicitly chose browser helper architecture.  
Standard: AE Development Rules v8.0.0  
Risk Profile: Critical — browser security + cross-process IPC + external content + future packaging.

## Components

### After Effects UXP plugin
Responsibilities:
- AE panel/workflow;
- create helper session/mailbox;
- launch/focus Browser Helper through the registered `motionbrowser://` scheme;
- consume validated helper events;
- persist/import media;
- create AE layers/keyframes;
- expose progress/errors/recovery.

Exact host/minimum version is verified when the AE bridge is implemented.

### Browser Helper
Technology baseline: Electron 44.5.1 / Chromium.

Responsibilities:
- own browsing session;
- render arbitrary sites;
- inspect DOM/CSS and supported animation state;
- provide element-selection UX;
- normalize selected content;
- write session-bound events for AE;
- never expose Node/native privileges to loaded sites.

## Trust boundary

```
Untrusted website
   ↓
Sandboxed Chromium WebContentsView
   ↓ fixed isolated selector
Browser Helper main process
   ↓ versioned mailbox event
UXP plugin-data session
   ↓ validated AE adapter
After Effects project
```

Remote pages must never receive:
- Node integration;
- filesystem/process APIs;
- toolbar preload bridge;
- mailbox/session paths or tokens;
- AE mutation APIs.

## Browser security baseline

Remote WebContentsView:
- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- `webSecurity: true`
- `allowRunningInsecureContent: false`
- no remote preload bridge
- automatic permission requests denied
- automatic downloads denied in M1
- only `http:` / `https:` top-level navigation
- `window.open` denied and safe URLs redirected into the same controlled view
- fixed selector code executes in an isolated world

Electron recommends keeping remote content isolated from Node and privileged APIs.

## Selection model

M1:
- text;
- image;
- observed text style metadata for future mapping.

Later:
- SVG;
- video/audio;
- color/gradient;
- Lottie;
- reference capture;
- supported animation descriptors.

Selectors are fixed application code. Site-provided strings are never evaluated as privileged code.

## AE ↔ Helper IPC

Primary design: filesystem mailbox, not localhost networking.

### Launch
1. UXP gets its persistent `plugin-data` native path.
2. UXP creates `sessions/<sessionId>/session.json` containing protocol version and random session token.
3. UXP calls `openExternal("motionbrowser://connect?...")`.
4. Registered helper opens/focuses and receives only mailbox path + session ID.
5. Helper reads the session file and writes `helper-ready.json`.

### Events
Helper writes atomic JSON envelopes under:
`sessions/<sessionId>/events/`

Each envelope contains:
- protocolVersion;
- eventId;
- sessionId;
- sessionToken;
- event type;
- timestamp;
- payload.

Writes use temp-file + rename so AE never consumes a partial JSON file.

### Why not localhost WebSocket first
UXP supports network APIs, but macOS imposes extra restrictions on insecure HTTP and self-signed secure WebSockets. The mailbox design needs only plugin sandbox storage plus a registered custom URL scheme, reducing permissions and certificate complexity.

The mailbox session token is a session-binding control, not protection against an already-compromised process running as the same OS user. Release security review must preserve this threat-model boundary or adopt stronger OS-backed IPC if needed.

## Failure model

Per operation:
- operationId;
- explicit state;
- per-item result;
- cancellation;
- partial failure;
- outcome-unknown state for AE mutations when acknowledgement is lost.

Do not automatically retry an AE mutation whose outcome is unknown.

## Milestones

### M1 — Helper core
- secure Chromium window;
- address navigation;
- element selection;
- text/image extraction;
- shared protocol;
- mailbox session;
- helper core/security tests.

### M2 — AE bridge
- create plugin-data session;
- launch/focus helper;
- consume events;
- text → Text Layer;
- image → persistent asset + import;
- Undo/recovery.

### M3 — v1 formats
- SVG;
- video/audio;
- colors/gradients;
- reference capture;
- Lottie;
- batch UX.

### M4 — animation mapping
- capability detector;
- supported simple motion → keyframes;
- fallback capture;
- explicit unsupported state.

### M5 — validation/release hardening
- helper packaging;
- process lifecycle/recovery;
- permission UX;
- signing/distribution per target OS/channel;
- full security/regression gates.

## Sources

- Electron security: https://www.electronjs.org/docs/latest/tutorial/security
- Electron WebContentsView/BaseWindow: https://www.electronjs.org/docs/latest/api/base-window
- Electron webContents isolated execution: https://www.electronjs.org/docs/latest/api/web-contents/
- Adobe UXP filesystem: https://developer.adobe.com/uxp/guides/how-to/recipes/filesystem-operations/
- Adobe UXP external process/custom scheme: https://developer.adobe.com/uxp/guides/how-to/recipes/external-process/
