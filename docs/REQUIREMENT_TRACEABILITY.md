# Requirement Traceability

Scope revision: 2026-10-05 initial product definition  
Delivery Gate: Development

| Requirement | Task / scope | Observable acceptance | Check / phase | Status / Evidence |
| --- | --- | --- | --- | --- |
| MB-CORE-001 One-action Send to AE workflow | TECH-001 + later integration | Selected supported content creates intended AE result | Runtime spike / integration | NOT RUN |
| MB-MEDIA-001 Import image/SVG/GIF/video/audio | Media pipeline | Supported file reaches AE without manual save/import | Integration | NOT RUN |
| MB-TEXT-001 Text → Text Layer | Conversion pipeline | Text remains editable in AE | AE runtime | NOT RUN |
| MB-STYLE-001 Colors/simple gradients | Conversion pipeline | Supported values become documented editable AE representation | AE runtime | NOT RUN |
| MB-ANIM-001 Lottie/simple supported animation | Motion conversion | Supported input maps deterministically to layers/keyframes | AE runtime | NOT RUN |
| MB-ANIM-002 Explicit fallback for unsupported motion | Capture pipeline | Unsupported conversion is reported and optional capture is offered | Integration | NOT RUN |
| MB-REF-001 Reference capture + URL/notes | Reference pipeline | Captured reference retains source metadata | Integration | NOT RUN |
| MB-BATCH-001 Batch import | Batch pipeline | Multiple selected items process in one operation with per-item results | Integration | NOT RUN |
| MB-DATA-001 Persistent imported assets | Storage | Restarting AE does not break imported source because temp data vanished | Restart test | NOT RUN |
| MB-SAFE-001 Partial failure does not corrupt project | Error/recovery | One failed item does not invalidate successful items or leave unknown mutation silently | Negative test | NOT RUN |

No check is PASS yet. This document is a planning/traceability record, not runtime evidence.
