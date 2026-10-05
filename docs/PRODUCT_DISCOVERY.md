# Motion Browser — Product Discovery / Vision

Status: Stage 0 in progress  
Date: 2026-10-05  
Standard: AE Development Rules v8.0.0

## 1. Product

Motion Browser is an After Effects tool for finding media and web motion on sites and sending selected content directly into an AE project with the highest practical level of editability.

Core promise:

> Found it → Send to AE → work.

Primary user: motion designer / After Effects user who routinely collects references, media and motion from the web.

Problem: today the user must manually download, convert, rename, import and often recreate web content before it becomes useful in After Effects.

Desired outcome: reduce that workflow to one selection and one send action.

## 2. Confirmed requirements

### Core
- Built-in browsing workflow connected to After Effects.
- Import images, SVG, GIF, video and audio.
- Text → editable AE Text Layer.
- Colors and palettes → reusable AE-side result.
- Simple gradients → editable representation where supported.
- Lottie → editable AE representation where practical and supported.
- Supported simple web animations → layers/keyframes where technically reliable.
- Unsupported/complex animation → captured as ready media where available.
- Reference capture from page region or video frame with source URL and notes.
- Batch import of multiple selected assets.
- Preserve editability where technically possible.
- One primary action: Send to AE.

### Later
- Broader web-animation reconstruction.
- More advanced style/CSS transfer.
- Smarter extraction/grouping of multi-element designs.
- Additional capture/export modes.

## 3. Non-goals for v1

- Rebuild arbitrary websites as fully editable AE compositions.
- Guarantee editable conversion of arbitrary JavaScript/WebGL/canvas animation.
- Execute arbitrary site code inside the AE project.
- Circumvent DRM, access controls, authentication restrictions or site permissions.
- Depend on deprecated CEP as the long-term architecture unless a bounded compatibility bridge is explicitly justified.

## 4. Core user flows

### Flow A — media
1. User opens Motion Browser.
2. Opens a page.
3. Selects one or more media assets.
4. Clicks Send to AE.
5. Assets are persisted locally, imported and placed in the active project/composition according to the selected mode.

### Flow B — editable web content
1. User selects text, color, gradient, Lottie or a supported simple animation.
2. Motion Browser classifies the content.
3. The tool shows the resulting AE representation before/while sending when ambiguity matters.
4. Send to AE creates editable layers/keyframes where the conversion contract is supported.
5. If editability is unsupported, the product offers a media capture fallback instead of pretending parity.

### Flow C — reference capture
1. User selects a page region or video frame.
2. Captures it as a reference.
3. Motion Browser stores the image plus source URL and optional note.
4. The reference becomes available in the AE project/workflow.

## 5. Product scope

### Core
- Browser/navigation surface.
- Element/asset selection.
- Media import.
- Text/colors/simple gradients.
- Lottie import.
- Reference capture.
- Batch send.
- Reliable local asset persistence.
- Clear editability/fallback classification.

### Important
- Preview of what will be created in AE.
- Progress/error/cancel states.
- Duplicate handling.
- Source metadata.

### Later
- Advanced CSS/motion reconstruction.
- Multi-element layout reconstruction.
- Smart style mapping.

## 6. Success criteria

- A supported image, video, audio or SVG can go from page selection to AE without manual save/import steps.
- Text arrives as editable text, not a rasterized image.
- Supported Lottie/simple animation conversion is deterministic and documented.
- Unsupported animation never silently claims editability; fallback is explicit.
- Batch import handles multiple selected assets in one operation.
- Imported assets remain valid after restarting AE because persistent source files are retained.
- A reference capture preserves its source URL.
- Failure of one asset in a batch does not corrupt the project or hide the remaining results.

## 7. Material constraints / open questions

### Blocking technical question
Can the current After Effects UXP runtime provide the required browser/WebView inspection and communication needed to select and extract arbitrary page content, or is a companion/helper browser required?

This must be resolved by official API research plus an isolated runtime spike before production Technical Design.

### Other open constraints
- Exact minimum AE version: not chosen yet.
- macOS/Windows support matrix: not chosen yet.
- Final distribution channel: not chosen yet.
- Whether a native/helper component is necessary: depends on the browser capability spike.

These are not product-scope questions, but they block final architecture/compatibility decisions.

## 8. Stage 0 exit check

- [x] Primary user is clear
- [x] Problem is clear
- [x] Desired outcome is clear
- [x] Main user flows are clear
- [x] Core scope is clear
- [x] Non-goals are explicit
- [ ] Material runtime/compatibility constraints are resolved
- [ ] Blocking browser/WebView capability question is resolved with evidence
- [x] Success criteria are observable

Stage 0 remains open only for the technical feasibility constraint above. Independent product documentation and research may continue.
