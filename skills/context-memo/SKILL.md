---
name: context-memo
description: Maintain the current state of ongoing work across phases, requirement changes, pauses, and fresh contexts. Use when starting or resuming multi-step work that needs durable progress, when the user changes direction or interrupts execution, and when context pressure or executor changes threaten continuity—even without an explicit checkpoint request.
compatibility: Optional bundled CLI requires Node ^22.22.2 || ^24.15.0 || >=26.0.0 and command/file tools. Context replacement requires a supported host adapter; persistence does not require one.
---

# Context memo

Keep enough current state to perform the next action without reconstructing the conversation. The memo supports execution; it is not a turn-by-turn report, a replacement for the user's instructions, or new authorization.

Keep the method proportional to the work. A small task can have one Phase. Reconcile direction at meaningful work boundaries rather than reclassifying every turn or rereading the entire Spec before each action.

## Start or resume work

1. Read the binding request and current corrections. Establish the **Spec**: original request, constraints, individually identified requirements, authoritative sources, and a revision. Historical notes cannot supply missing authority.
2. Select a stable `workId` matching `[a-z0-9][a-z0-9_-]{0,79}`. Resume the matching work, not merely the newest record. If identity is ambiguous, list records and reconcile their state with the request.
3. For existing work, load the current view before acting. Retrieve full state or supporting evidence as needed and inspect volatile files relevant to the next action. Do not reuse stale edit anchors, assume ownership of old jobs, or rerun checks merely to rediscover recorded results.
4. Define the **Scope**, the goal and boundary of this work. Divide it into **Phases** where useful, with requirement coverage, dependencies, and observable completion conditions. Scope is not a Phase; neither is a context window.
5. Elaborate executable **Tasks** just in time for the current Phase. Give each requirement coverage, dependencies, and observable completion conditions. Keep future Phases at goal/dependency/completion-condition level instead of expanding a speculative task tree. Retain previously recorded unfinished Tasks outside the current Phase.

Select the next eligible Phase and Task from that state, then do the work under the user's current authorization.

## Advance from observed results

Record actual changes, checks, and outcomes separately from assumptions. A check run before an edit does not verify that edit.

- Mark a Task `done` only with evidence satisfying its completion conditions.
- Mark a requirement `met` only with supporting evidence. Keep open requirements visible across Phases.
- Before marking a Phase `done`, check its requirement coverage and unfinished Tasks, not just checked boxes.
- Both `done` and `cancelled` Phases must have no unfinished Tasks. Cancel affected Tasks explicitly with reasons, or move retained work to an open Phase so the current view cannot hide it.

Refresh and persist forward state before the next substantive action when any of these changes occurs:

- **Task result or Phase completion:** record evidence and the next action; select or plan the next eligible work.
- **Failed assumption or blocker:** record the failure, affected work, and next supported action. Do not advance dependent work as though it succeeded.
- **User amendment:** revise the Spec first. Mark only affected requirements, Phases, and Tasks `needs-review`; preserve unaffected completed results and evidence. Retain pending obligations unless explicitly withdrawn or cancelled. Carry withdrawal decisions forward so the original request cannot revive removed scope. A progress-only update does not change the Spec revision.
- **Pause or stop:** stop execution and owned jobs immediately. Record `paused`, not `done`, and a resumption action only if persistence is permitted. A prohibition on further tool use forbids saving too. Do not promise capture after a hard kill.
- **Unrelated detour:** leave the original work paused under its existing `workId` and select another identity for the detour. Do not overwrite the original Spec with an unrelated request.

## Persist the complete state

Honor an explicit user destination and its safe update mechanism. Otherwise use the bundled CLI. Resolve the absolute `scripts/context-memo.cjs` path from this skill's installed directory, not from the target repository or current directory. The single executable needs no npm installation or adjacent dependencies.

Pass the target workspace and work identity explicitly:

```sh
CLI="/absolute/path/to/context-memo/scripts/context-memo.cjs"
WORKSPACE="/absolute/path/to/checkout"

node "$CLI" list --workspace "$WORKSPACE"
node "$CLI" load --work catalog --view current --workspace "$WORKSPACE"
node "$CLI" load --work catalog --view full --workspace "$WORKSPACE"
node "$CLI" save --work catalog --expect SNAPSHOT_SHA256 --file "/absolute/state.json" --workspace "$WORKSPACE"
```

The private default store is outside the checkout. For an intentional override, append `--store "/absolute/private-store"` to every command, or use `CONTEXT_MEMO_HOME`.

### Prepare a replacement

- Use [the v1 state example](assets/state.example.json) for the field shape. Keep all fields, using empty arrays or null pointers where appropriate.
- `load --view full` returns an envelope; edit its `state`, not the envelope. The current view is selective and cannot replace the complete stored document.
- Keep IDs and references consistent and dependency graphs acyclic. Current pointers identify active, paused, blocked, or reviewed work. Evidence names an observation or accessible artifact, not a promised check.
- Change `spec.revision` when the binding contract changes; its value need not be a hash.

### Publish without overwriting another writer

Read and reconcile existing state before replacing it. Use the latest returned snapshot `revision` as `--expect`. This SHA-256 identifies the exact saved bytes; it is not `spec.revision`.

Create a new record with `--expect missing` only after confirming absence through `load` exit 2 or `list`. Supply UTF-8 JSON through `--file`, or through stdin when omitting that flag.

On conflict (exit 3), reload and reconcile before saving with the new revision. On busy (exit 4), do not remove another writer's lock. Other failures do not authorize clobbering or silent defaults.

Require the save acknowledgement with path and revision before treating an update as persisted. Keep prepared state if saving fails; an outdated save cannot support a context transition.

### When persistence is unavailable

If Node or command tools are unavailable, use an authorized file destination and respect its actual limits. With no writable destination or tools, provide compact forward state inline: work identity, the binding Spec with an explicit revision, pending work, relevant proof, and the next action. Identify it as unsaved; do not claim persistence or a context reset.

## Replace context only when useful and supported

Context replacement is separate from state management. Do not reset automatically at every Phase. When accumulated history is mostly irrelevant or context pressure threatens continuity, finish a safe work boundary and save current state first. Never interrupt a write or owned operation to swap.

Within the user's ongoing approval of this protocol, choose replacement at that boundary without asking for a manual checkpoint each time. Keep host-specific operations in an adapter:

- If OMP exposes `context_notes`, `new_context`, `read`, and `grep`, read [the OMP adapter](references/omp.md) and follow it.
- Otherwise use a documented adapter supplied by the host. If none is available, continue ordinary state management and report that no context replacement occurred.

The CLI cannot reset its parent session. A saved note, queued request, or acknowledgement is not proof that a fresh context is active.

After an actual boundary, read the continuation brief, reload this skill and the current state, inspect next-action-relevant volatile files, and perform the next supported action. Briefly report saved versus unsaved state, transition status, or a blocker where relevant; do not substitute another handoff report for execution.
