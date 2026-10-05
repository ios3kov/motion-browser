# Project Status

Last updated: 2026-10-05

## Goal and current scope

Build Motion Browser: a web-to-After-Effects workflow where the user finds an asset or supported web motion, chooses it and sends it directly to AE with maximum practical editability.

- Product contract: docs/PRODUCT_DISCOVERY.md
- Standard: AE Development Rules v8.0.0
- Delivery Gate: Development
- Current Risk Profile: Standard for research/design. Escalate if helper/native IPC, security-sensitive browser integration or destructive file behavior enters implementation.
- Current branch: feat/initial-product-contract

## Confirmed boundaries

- v1 focuses on media, text, colors/simple gradients, Lottie/simple supported animations, reference capture and batch import.
- Unsupported complex web animation falls back to captured media where available.
- Arbitrary full website reconstruction is not a v1 goal.
- CEP is not assumed as the long-term architecture.
- No release/publishing action is part of the current scope.

## Current observed state

- Repository initialized.
- Initial Product Discovery / Vision recorded.
- Requirement traceability recorded.
- Official-source UXP/WebView feasibility research completed.
- No production architecture selected yet.
- No AE runtime artifact exists yet.
- Pure UXP arbitrary-site DOM extraction: Evidence UNVERIFIED.
- Test Status: NOT RUN — no compatible runtime candidate has been executed yet.

## Current findings

- After Effects UXP documentation is available and current host API members declare Min Version 27.0.
- Adobe's current roadmap says After Effects UXP public beta is planned by November 2026.
- UXP WebView officially supports URL loading and postMessage.
- The documented WebView API does not expose a general executeScript/contentScript API for injecting extraction logic into arbitrary third-party pages.
- A controlled page we own can be used for the first end-to-end spike; that does not prove arbitrary-site support.

Detailed record: docs/TECH-001-BROWSER-FEASIBILITY.md

## Current block

1. Product contract — completed for known scope.
2. Official UXP/WebView research — completed.
3. Runtime TECH-001 spike — next.
4. Production architecture + Product Spec + Technical Design + Production Plan — blocked on TECH-001 evidence.

## Blockers

| Blocker | Impact | Unblocking condition | Independent work |
| --- | --- | --- | --- |
| Compatible AE UXP runtime not yet verified in the development environment | Runtime TECH-001 | Run the spike in an AE build that supports the documented UXP API | Build controlled spike source/test page |
| Arbitrary-page inspection capability unproven | Final architecture | Runtime evidence or explicit supported API | Extraction schema/test cases |
| Minimum AE/OS matrix not chosen | Compatibility contract | Architecture evidence first, then choose supported baseline | Research |

## Next action

Prepare the TECH-001 controlled proof source:
- UXP panel/WebView shell;
- controlled local/test page;
- image + text selection payload;
- AE-side mutation path using only documented host APIs;
- structured logs and test instructions.

Stop criterion for this block: source is reproducible and statically validated. Runtime Test Status remains NOT RUN until it is executed in a compatible After Effects UXP build.
