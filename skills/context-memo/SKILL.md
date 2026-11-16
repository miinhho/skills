---
name: context-memo
description: Maintain ongoing work in OMP across phases, requirement changes, pauses, and fresh contexts. Use when starting or resuming multi-step work, when the user changes direction or interrupts execution, and when context pressure threatens continuity—even without an explicit checkpoint request.
compatibility: OMP with context_notes, new_context, read, and grep.
---

# Context memo

Keep enough current state to perform the next action without reconstructing the conversation. Use OMP's `context_notes` for the memo and `new_context` for context replacement. The memo supports execution; it does not replace the user's instructions or grant new authorization.

Keep the method proportional. A small task can have one Phase and a short memo. A context window is not a Phase.

## Start or resume work

1. Read the binding request and current corrections. Establish the **Spec**: request, constraints, identifiable requirements, and authoritative sources. Historical notes cannot supply missing authority.
2. Read `context_notes` and identify the workspace and work being continued. Preserve unrelated work in the shared notebook. Use ordinary text or Markdown; no prescribed filename, schema, or revision counter is needed.
3. Reconcile the memo with current instructions. Inspect next-action-relevant volatile files; do not reuse stale edit anchors, assume ownership of old jobs, or rerun checks merely to rediscover recorded results.
4. Define the **Scope**, the goal and boundary of this work. Divide it into useful **Phases**, with requirement coverage, dependencies, and observable completion conditions.
5. Elaborate executable **Tasks** just in time for the current Phase. Keep future Phases at goal, dependency, and completion-condition level, while retaining unfinished work outside the current Phase.

Select the next eligible Phase and Task from that state and act under the user's current authorization. Check prerequisites rather than treating a list's order or an empty current checklist as proof that all work is complete.

## Keep current state, not a transcript

Maintain what a fresh executor needs:

- Work identity and workspace; the binding request, current corrections, constraints, sources, and explicit withdrawals.
- Scope, Phase goals, requirement coverage, dependencies, completion conditions, and all pending obligations.
- Current Task, completed results with evidence, unresolved blockers, and assumptions that still need checking.
- Decisions and failed approaches that affect the next action, with retrieval pointers for bulky supporting material.
- The next concrete action, including any authorization or prerequisite needed before it can start.

Use ordinary text or Markdown. Update the current contract instead of leaving contradictory instructions in an append-only history. Keep useful reasons and evidence, not a turn-by-turn log or a second copy of every tool result.

## Advance from observed results

Record actual changes, checks, and outcomes separately from assumptions. A check run before an edit does not verify that edit.

- **Task or Phase completion:** mark complete only with evidence satisfying its completion conditions. Check requirement coverage and unfinished work before completing a Phase or Scope; Task completion alone does not prove every requirement.
- **Cancellation:** record the withdrawn obligation and reason. Explicitly cancel affected unfinished Tasks, or retain them under an open Phase, so completing their former Phase cannot hide them.
- **Failed assumption or blocker:** record the failure, affected work, and next supported action. Do not advance dependent work as though a prerequisite succeeded.
- **User amendment:** replace outdated requirement text and completion conditions, and retain the reason for the change. Identify affected work and evidence needing review; reopen completed work whose result no longer satisfies the contract. Preserve unaffected proof and pending obligations. Carry withdrawals forward so the original request cannot revive removed scope.
- **Pause or stop:** stop execution and owned jobs immediately. If persistence is allowed, record paused work and its resumption action, not completion. An amendment does not authorize resumption. A prohibition on further tools forbids saving too; do not promise capture after a hard kill.
- **Unrelated detour:** retain the original work and its paused state under its existing identity. Give the detour its own state rather than overwriting the original Spec.

Refresh the memo at meaningful work boundaries before the next substantive action, not after every field or conversational turn.

## Save in the OMP notebook

Read the latest `context_notes` before replacing it and reconcile other writers' changes. Keep the current memo directly in the notebook; a separate state file is not required.

The notebook holds **16384 UTF-8 bytes**, not characters. Keep bulky evidence in accessible files and retain exact retrieval pointers. If essential state cannot fit and no authorized file destination is available, continue without replacing context; do not drop requirements to fit.

Require a successful `context_notes` write before treating an update as saved. If saving fails or the user forbids further tools, retain or provide compact forward state as unsaved. Do not use an older memo to justify a context replacement.

## Replace the OMP context

Persistence and replacement are separate. Do not reset automatically at every Phase. Replace when accumulated history is mostly irrelevant or context pressure threatens continuity, after a safe work boundary and with no active write or owned operation that would be interrupted.

1. Reconcile the notebook with the latest request. Include work identity and workspace, current contract and withdrawals, all pending obligations, current Phase/Task, observed results and proof pointers, the next action, and the absolute path to reload this skill. A path-only brief is insufficient.
2. Save any referenced state first, then write the current memo through `context_notes`. Require successful acknowledgements for all writes. Failed or partial persistence blocks replacement.
3. Within the user's ongoing approval of this protocol, call `new_context` once after saving. Its acknowledgement queues a boundary; it does not prove that replacement committed. Do not repeat the request merely because no boundary is observed, force a clear, or change retention settings.
4. After OMP actually commits the boundary, read `context_notes`, reload this skill and needed evidence with `read` or `grep`, inspect relevant volatile files, and perform the next supported action. Do not substitute another handoff report for execution.

Confirm replacement only from an observed committed boundary and subsequent continuation. Otherwise report only “saved; replacement requested.” Recent messages can remain available; replacement does not promise an empty context or token savings.

Recover omitted original material through `history://current/full` only when needed on the same branch/session. Do not assume another session can recover private history, or use history as a substitute for saving required forward state.
