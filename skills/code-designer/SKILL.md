---
name: code-designer
description: Design module responsibilities, state ownership, interfaces, dependencies, and acceptance evidence before implementation planning, then validate the design in an independent reviewer context. Also use for review-only requests about a supplied design; do not regenerate it or implement code.
---

# Code designer

Decide what should change, where it belongs, and how to judge it. This skill owns design and design validation, not implementation, cleanup, or merge-readiness review. Scale the artifact to the decisions: a small existing-module change does not need new modules or an elaborate document.

## Select the mode

- **Design and review:** derive a proposal using [the design method](references/design-method.md), then obtain independent review using [the review method](references/review-method.md).
- **Supplied-design review only:** review the supplied proposal with the review method. Do not first replace it with your own design. If you did not author the proposal and are in a fresh reviewer context, perform that review directly.
- **Explicit design-only request:** produce the design artifact and identify independent review as not performed. Do not claim the design is independently validated.

Read the relevant local method before that phase. Both methods are bundled here; no sibling skill, particular host command, tracker setup, or external service is required.

## Keep review independent

A designer checking their own work in the same context is not independent validation. When reviewer execution is available, start a separate reviewer context that did not author the design. Give it the original request, scope and constraints, the proposed artifact, source/contract locations, and permission boundaries. Ask it to independently inspect the consequential claims rather than accept the designer's summary. Supply the local review method, not the designer's private reasoning or desired verdict.

When a separate reviewer is unavailable, report that limitation plainly. You may label a same-context check as self-review, but leave independent validation outstanding. Do not invent a reviewer, successful dispatch, or approval.

## Resolve the review

The reviewer classifies findings as `blocking`, `advisory`, or `none`, with requirement/evidence, impact, and the smallest correction. A missing implementation or unexecuted planned check is not by itself a blocking design defect. Unsupported high-risk assumptions and evidence that cannot establish the promised outcome can be blocking.

Return blocking findings to the designer. Revise the affected design and acceptance evidence, then request another independent review of the revision and changed claims; keep the original requirements available. Stop at a justified design verdict, not an arbitrary number of rounds. If a missing requirement or material choice cannot be settled by available evidence, surface that specific decision instead of silently choosing it. Advisory findings inform later planning without manufacturing a redesign.

## Deliver

Connect the goal and preserved contracts to source-grounded responsibility/interface decisions, material alternatives, acceptance evidence, and remaining uncertainty. Distinguish observed implementation, supplied contracts, hypotheses, and proposals. Include the review mode and actual independence status, findings/verdict, and any unresolved blocking decisions. Planned observations are not executed results. Do not edit production code, produce implementation task lists, or claim code quality, coverage, performance gains, or E2E success from a design review.
