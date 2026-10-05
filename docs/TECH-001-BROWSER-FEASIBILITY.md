# TECH-001 — Browser-to-AE Feasibility Spike

Status: research complete; runtime proof pending  
Date: 2026-10-05  
Risk Profile: Standard research; raise if native/helper IPC becomes part of the candidate architecture.

## Question

What is the smallest supported architecture that can:

1. display/navigate a web page;
2. let the user identify a media/text/style/motion target;
3. inspect enough source data to classify/extract it;
4. transfer that data safely to AE-side code;
5. create one observable AE result?

## Official-source findings

### After Effects UXP state

Adobe's current After Effects UXP site exposes a host API and describes the documentation as beta material. The current API reference marks host members with minimum After Effects version 27.0.

Adobe's September 24, 2026 extensibility roadmap states that After Effects UXP plugins are planned for public beta by November 2026 and that CEP is being phased out long-term.

Sources:
- https://developer.adobe.com/after-effects/uxp/
- https://developer.adobe.com/after-effects/uxp/after-effects-api/
- https://blog.developer.adobe.com/en/publish/2026/09/investing-in-the-future-of-creative-cloud-extensibility-uxp-comes-to-our-flagship-applications

### UXP WebView

The documented UXP HTMLWebViewElement supports:
- loading a URL;
- WebView permissions/domains in manifest v5+;
- load lifecycle events;
- plugin ↔ WebView messaging with postMessage when the loaded content participates in the message bridge.

The documented HTMLWebViewElement API does not expose a general executeScript/contentScript/evaluateJavaScript method for injecting arbitrary extraction code into an unrelated remote page.

Source:
- https://developer.adobe.com/premiere-pro/uxp/uxp-api/reference-js/global-members/html-elements/html-web-view-element

This is a source-level observation, not proof that no undocumented behavior exists. Undocumented behavior must not become the production contract.

## Current conclusion

Pure UXP is still the preferred first candidate for AE integration, but arbitrary-site DOM extraction is **Evidence: UNVERIFIED**.

A controlled WebView page that we own can communicate with the plugin. That does not prove we can inspect arbitrary third-party pages, because those pages do not contain our extraction/message-handler code by default.

Therefore production architecture is not selected yet.

## Candidate paths

### A. Pure UXP

Use only supported After Effects UXP panel/WebView/host APIs.

Accept only if the runtime spike proves the actual extraction contract needed by Motion Browser without undocumented script injection.

### B. UXP + companion/helper

Use UXP as the AE UI/integration layer and a controlled browser/helper for page inspection/extraction.

This becomes the leading fallback if pure UXP cannot instrument arbitrary pages. It adds IPC, packaging, security and lifecycle risk and therefore requires its own design/test scope.

### C. CEP bridge

Not a default production choice. Evaluate only as a bounded compatibility bridge if it uniquely unlocks a required workflow and has an explicit migration/exit plan.

## Runtime spike slice

First prove the smallest supported case:

- run a compatible After Effects UXP build;
- load a controlled test page in WebView;
- select one image and one text element;
- obtain image source + text content through documented mechanisms;
- send payload to AE;
- create/import the corresponding AE result;
- record exact host/runtime versions and evidence.

Then run a second boundary test against an unrelated remote page:

- verify what can and cannot be inspected without page cooperation;
- do not use undocumented script injection as acceptance.

## Evidence required

- Official Adobe API references for every host/runtime API used.
- Exact AE version and UXP runtime/plugin version.
- Reproducible test page.
- Logs with operation/correlation ID.
- Screenshot/video of the AE result.
- Clear Test Status.
- If unsupported: exact missing capability and source/runtime evidence.

## Decision gate

Pure UXP becomes the production candidate only if the spike proves both:
1. reliable AE-side mutation; and
2. sufficient page inspection/extraction for the agreed Motion Browser workflow.

If arbitrary-page inspection is not supported, proceed to helper architecture research. Do not downgrade the requirement silently and do not treat a controlled page as evidence for arbitrary sites.
