# TECH-001 — Browser-to-AE Feasibility Spike

Status: planned  
Risk Profile: Standard research; raise if native/helper IPC becomes part of the candidate architecture.

## Question

What is the smallest supported architecture that can:

1. display/navigate a web page;
2. let the user identify a media/text/style/motion target;
3. inspect enough source data to classify/extract it;
4. transfer that data safely to AE-side code;
5. create one observable AE result?

## Candidate paths

### A. Pure UXP
Use only supported After Effects UXP panel/WebView/host APIs.

Preferred if the runtime exposes the necessary inspection/communication contract.

### B. UXP + companion/helper
Use UXP as the AE UI/integration layer and a companion browser/helper for page inspection/extraction.

Use only if pure UXP cannot satisfy the extraction contract or imposes unacceptable restrictions.

### C. CEP bridge
Not a default production choice. Evaluate only as a bounded compatibility bridge if it uniquely unlocks a required workflow and has an explicit migration/exit plan.

## Spike slice

Target one deterministic case first:

- open a controlled local/test HTML page;
- select one image and one text element;
- obtain image source + text content through documented mechanisms;
- send payload to AE;
- create/import the corresponding AE result;
- record exact host/runtime versions and evidence.

Do not begin arbitrary-site support until the controlled case works.

## Evidence required

- Official Adobe API references for every host/runtime API used.
- Exact AE version and plugin/runtime version.
- Reproducible test page.
- Logs with operation/correlation ID.
- Screenshot/video of the AE result.
- Clear Test Status.
- If unsupported: exact missing capability and source/evidence, not a guess.

## Decision gate

Pure UXP becomes the production candidate only if the spike proves the required inspection + host mutation path using supported APIs.

If it cannot, move to helper architecture research without pretending the unsupported behavior is stable.
