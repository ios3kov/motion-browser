# Motion Browser — Product Spec v0.1

Status: active implementation contract  
Date: 2026-10-05

## Product promise

**Found it → Send to AE → work.**

The user browses the web in Motion Browser, selects useful content and sends it to After Effects with the highest supported editability and an explicit fallback when editability is not reliable.

## v1 functional contract

### Browser
- Open arbitrary HTTP/HTTPS pages in Browser Helper.
- Address navigation.
- Safe single-element selection.
- Batch selection before v1 release.
- Preserve normal site rendering while selection mode is inactive.

### Media
- Images.
- SVG.
- GIF.
- Video.
- Audio.

Result: source is acquired/persisted and imported to AE without a manual save/import workflow.

### Text
- Selected visible text becomes an editable AE Text Layer.
- Source text is preserved.
- Basic observed style metadata may be used where mapping is reliable.
- Unsupported CSS is not silently fabricated.

### Styles
- Colors/palettes.
- Simple gradients.
- Mapping is explicit and deterministic.

### Motion
- Lottie: editable representation where supported.
- Simple supported web animation: layers/keyframes where conversion is deterministic.
- Complex/unknown animation: explicit capture fallback.
- No claim of universal website-to-AE reconstruction.

### References
- Capture page region/video frame.
- Preserve source URL.
- Optional note.
- Reference survives restart.

### Batch
- Multiple selected items can be sent in one operation.
- Per-item status is visible.
- One failed item does not hide successful items.

## User-facing states

- Helper not installed/not available.
- Helper launching.
- Connected.
- Loading page.
- Select mode active.
- Selection ready.
- Sending.
- Sent.
- Partial failure.
- Unsupported editable conversion.
- Capture fallback available.
- Cancelled.
- Recovery required.

## Security behavior

- Website is treated as untrusted.
- Website never gets native/Node/AE privileges.
- Unsafe top-level URL schemes are blocked.
- Browser permission requests are denied by default and introduced only per explicit product requirement.
- Automatic downloads are not trusted as asset acquisition.
- AE mutations validate incoming payload schema and session.

## Data contract

Each Send operation has:
- schemaVersion;
- operationId;
- page URL/title;
- one or more normalized items;
- per-item type;
- source metadata;
- optional observed style/motion metadata.

## Acceptance for first useful milestone

M1 is successful when:
1. helper opens as a working browser;
2. user can navigate to a normal site;
3. Select highlights an element;
4. text or image selection is normalized;
5. a connected session receives an atomic `selection.ready` event;
6. automated core/security tests pass;
7. no remote page has Node/native access.

AE creation of actual layers is M2 and is not claimed by M1.
