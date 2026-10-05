# ADR-001 — Browser helper is a primary component

Date: 2026-10-05  
Status: Accepted

## Decision

Use an Electron/Chromium browser helper as a first-class Motion Browser component instead of relying on After Effects WebView DOM access.

## Reason

The core product requires inspecting arbitrary sites. The helper gives Motion Browser a controlled Chromium environment with documented page-script execution and isolation capabilities.

## Consequences

Positive:
- full control over DOM inspection and selection UX;
- not blocked by AE WebView injection limitations;
- browser/extraction layer can be developed and tested independently of AE UXP availability;
- consistent extraction behavior across supported AE versions.

Costs:
- separate helper process;
- IPC protocol;
- packaging/signing/distribution work;
- larger security surface;
- process lifecycle/recovery complexity.

## Required controls

- remote pages never get Node/native privileges;
- authenticated loopback-only IPC;
- schema/versioned messages;
- security review before validation handoff;
- helper process identity and lifecycle checks;
- explicit packaging/update strategy before release.

This decision does not authorize release or distribution.
