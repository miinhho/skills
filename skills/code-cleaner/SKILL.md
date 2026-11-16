---
name: code-cleaner
description: Implement scoped behavior-preserving cleanup and refactoring of duplicated, dead, overcomplicated, or AI-generated code, with real baseline and post-change verification. Use for localized cleanup or implementing a justified structural refactor; escalate consequential ownership/interface decisions rather than silently redesigning.
---

# Code cleaner

Improve the code while preserving the authorized observable behavior. Accept a concrete cleanup goal, scoped audit findings, or a justified design. This skill implements changes; it is not a substitute for a diagnostic-only audit or a request for new behavior.

## Establish the boundary

Read the request, applicable repository guidance, relevant source and callers. Identify the target problem, allowed files, existing user changes, and preserved contracts. Make a short categorized inventory only as large as needed: dead code, duplicated policy, needless wrapper/abstraction, avoidable complexity, or misleading generated scaffolding. Show why the target is unnecessary; do not remove necessary checks or valid domain structure merely because it looks generated.

Choose the smallest coherent cleanup and its verification boundary using [the local safety guidance](references/safety.md). Prefer deletion, simplification, and reuse of the existing owner over new layers. Similar syntax alone does not justify merging unrelated policies. Do not expand scope, add dependencies, or alter error behavior as an unrequested improvement.

## Decide whether design is needed

Localized behavior-preserving simplification can proceed directly; no mandatory audit→design→clean pipeline applies. If the work redistributes significant responsibilities, changes state/lifecycle ownership, module boundaries, public interfaces, or compatibility contracts, stop that part before editing and require a justified design decision. Use code-designer if installed, or arrange an explicit design and separate review through the available host/user process; do not depend on its files being installed. A missing independent reviewer must be reported, not simulated in the same context. An already supplied justified design need not be regenerated; check that it actually covers this change and its contracts.

Distinguish an intended behavior change from a refactor. If preserving the required contract is incompatible with the request, surface that decision rather than disguising a feature or bug fix as cleanup. Continue only independent authorized local work that does not prejudge it.

## Establish evidence, then change incrementally

Identify behavior at real consumer boundaries, including relevant failure, empty-input, ordering, timing, state/lifecycle, and compatibility behavior. Use existing checks when sufficient and add characterization cases when gaps matter. Establish and record baseline observations before risky changes. Choose checks that exercise the affected behavior and keep their scope proportionate to the change.

Perform one coherent change at a time. Run risk-specific checks after each meaningful change and inspect the affected consumers. There is no universal smell-removal order: verification and dependencies determine safe increments. Do not claim execution from a plan, source reasoning, generated test code, or a reported past pass.

If baseline checks are unavailable, report the exact prerequisite and unresolved behavior lock; do not start risky edits. A preexisting failing check is not a passing baseline: distinguish it, its relevance, and whether safe progress remains possible. If post-change verification fails, stop stacking cleanup, diagnose the failure, and fix within the authorized scope or restore only your own unsafe change. Preserve unrelated edits throughout; never reset or overwrite other work to recover.

## Close with evidence

Report modified files, concrete simplifications, actual baseline/post-change commands and observations, and remaining risks or unverified claims. Say what the evidence establishes and what it does not. A source-only review, prepared handoff, or unexecuted probe is not a completed cleanup with behavior preservation. If blocked, distinguish edits made from verification missing and do not report success.
