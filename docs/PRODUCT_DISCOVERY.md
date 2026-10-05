# Motion Browser — Product Discovery / Vision

Status: Stage 0 complete for product scope  
Date: 2026-10-05  
Standard: AE Development Rules v8.0.0

## Product

Motion Browser is an After Effects tool for finding media and web motion on sites and sending selected content directly into an AE project with the highest practical level of editability.

Core promise:

> Found it → Send to AE → work.

Primary user: motion designer / After Effects user who routinely collects references, media and motion from the web.

Problem: today the user must manually download, convert, rename, import and often recreate web content before it becomes useful in After Effects.

Desired outcome: reduce that workflow to one selection and one send action.

## Confirmed requirements

### Core
- Browser workflow connected to After Effects.
- Browser Helper is a first-class component of the architecture.
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

## Non-goals for v1

- Rebuild arbitrary websites as fully editable AE compositions.
- Guarantee editable conversion of arbitrary JavaScript/WebGL/canvas animation.
- Execute arbitrary site code inside the AE project.
- Circumvent DRM, access controls, authentication restrictions or site permissions.
- Use CEP as the primary long-term architecture.

## Core user flows

### Media
1. User opens Motion Browser from the AE workflow.
2. Browser Helper opens the requested site.
3. User selects one or more media assets.
4. Clicks Send to AE.
5. Assets are persisted locally, imported and placed in the active project/composition according to the selected mode.

### Editable web content
1. User selects text, color, gradient, Lottie or a supported simple animation.
2. Browser Helper classifies the content.
3. Motion Browser shows/records the resulting AE representation when ambiguity matters.
4. Send to AE creates editable layers/keyframes where the conversion contract is supported.
5. Unsupported editability uses an explicit media capture fallback.

### Reference capture
1. User selects a page region or video frame.
2. Captures it as a reference.
3. Motion Browser stores the image plus source URL and optional note.
4. The reference becomes available in the AE workflow.

## Product scope

### Core
- Browser/navigation surface.
- Element/asset selection.
- Browser Helper lifecycle.
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
- Secure separation between untrusted websites and native/helper privileges.

### Later
- Advanced CSS/motion reconstruction.
- Multi-element layout reconstruction.
- Smart style mapping.

## Success criteria

- A supported image, video, audio or SVG can go from page selection to AE without manual save/import steps.
- Text arrives as editable text, not a rasterized image.
- Supported Lottie/simple animation conversion is deterministic and documented.
- Unsupported animation never silently claims editability; fallback is explicit.
- Batch import handles multiple selected assets in one operation.
- Imported assets remain valid after restarting AE because persistent source files are retained.
- A reference capture preserves its source URL.
- Failure of one asset in a batch does not corrupt the project or hide the remaining results.
- Remote websites never receive Node/native/helper/AE privileges.

## Constraints / resolved decisions

- Browser Helper: confirmed by user on 2026-10-05.
- Initial helper technology: Electron/Chromium.
- Initial Electron development baseline: stable 44.5.1.
- Remote web content is untrusted and sandboxed.
- Primary IPC candidate: UXP plugin-data mailbox + custom `motionbrowser://` launch scheme, avoiding localhost network IPC.
- Exact minimum AE/UXP version remains a compatibility contract for the AE adapter and does not block helper development.
- Final distribution/signing channel remains a release-stage decision.

## Stage 0 exit check

- [x] Primary user is clear
- [x] Problem is clear
- [x] Desired outcome is clear
- [x] Main user flow is clear
- [x] Core scope is clear
- [x] Non-goals are explicit
- [x] Material product constraints are known
- [x] Browser/helper architecture decision is resolved
- [x] Success criteria are observable
- [x] Remaining compatibility questions do not block Product Spec or helper implementation

Next: Product Spec → Technical Design → Production Plan → implementation.
