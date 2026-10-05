# Project Status

Last updated: 2026-10-05

## Goal and current scope

Build Motion Browser: a web-to-After-Effects workflow where the user finds an asset or supported web motion, chooses it and sends it directly to AE with maximum practical editability.

- Product contract: docs/PRODUCT_DISCOVERY.md
- Standard: AE Development Rules v8.0.0
- Delivery Gate: Development
- Current Risk Profile: Standard for research/design. Escalate if helper/native IPC, security-sensitive browser integration or destructive file behavior enters implementation.
- Current branch: feat/initial-product-contract
- Tracking: issue #1, draft PR #2

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
- TECH-001 extraction payload protocol implemented.
- Controlled text/image WebView test page implemented.
- Dependency-free automated protocol tests added.
- GitHub Actions workflow added; current run is queued, therefore Test Status is NOT RUN until it actually completes.
- No production architecture selected yet.
- No AE runtime artifact exists yet.
- Pure UXP arbitrary-site DOM extraction: Evidence UNVERIFIED.

## Current findings

- After Effects UXP documentation is available and current host API members declare Min Version 27.0.
- Adobe's current roadmap says After Effects UXP public beta is planned by November 2026.
- UXP WebView officially supports URL loading and postMessage.
- The documented WebView API does not expose a general executeScript/contentScript API for injecting extraction logic into arbitrary third-party pages.
- A controlled page we own can use the bridge; that does not prove arbitrary-site support.

Detailed record: docs/TECH-001-BROWSER-FEASIBILITY.md

## Completed block

TECH-001 independent protocol slice:
- schema v1 for text/image selections;
- batch-ready payload;
- validation and normalization;
- controlled selection page;
- CI test definition.

Candidate HEAD for this block: c7e804f04574fedad2185a8ad91a56092c90fd26

## Blockers

| Blocker | Impact | Unblocking condition | Independent work |
| --- | --- | --- | --- |
| Compatible AE UXP runtime not yet verified in the development environment | AE runtime TECH-001 | Execute the spike in a compatible After Effects UXP build | Protocol/extraction work |
| Arbitrary-page inspection capability unproven | Final architecture | Runtime evidence or explicit supported API | Helper architecture research |
| Authoritative AE UXP host manifest contract/sample is not yet established in project Evidence | Runnable package | Official Adobe sample/docs or verified runtime manifest | Keep spike host-neutral |
| Minimum AE/OS matrix not chosen | Compatibility contract | Architecture evidence first, then choose supported baseline | Research |

## Test / Evidence

- Protocol source: implemented.
- Automated test definitions: implemented.
- GitHub Actions: queued at time of this checkpoint.
- Protocol Test Status: NOT RUN.
- AE runtime Test Status: NOT RUN.
- Compatibility Status: UNKNOWN for AE UXP runtime.
- Evidence Confidence for arbitrary-page extraction: UNVERIFIED.

## Next action

1. Record CI result once an actual run result exists.
2. Research the companion/helper browser path in parallel because arbitrary-page DOM instrumentation is the main architecture risk.
3. Build the AE UXP bridge only from an authoritative/verified host manifest and API contract.
4. Run the controlled test in compatible AE UXP, then the unrelated-page boundary test.

Stop criterion for TECH-001: either a supported pure-UXP path is proven for the required workflow, or the exact unsupported boundary is demonstrated and the helper architecture becomes the production candidate.
