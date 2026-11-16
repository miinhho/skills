# Risk-specific cleanup safety

Use this guidance to choose the smallest evidence that can falsify a regression. It is not a command to run every check or introduce every abstraction.

## Preserve contracts, not just happy-path values

Trace the actual callers before editing. Public behavior may include returned identity, mutation, input consumption, ordering, exact serialization, exception type/timing, callbacks, side effects, and state lifetime. A green unit test that bypasses the affected consumer does not prove its outcome. Derive expected results from the contract independently of the proposed rewrite.

| Target | Appropriate baseline and post-change evidence |
| --- | --- |
| Duplicate branches or wrappers | Exercise each distinct branch through a real caller, including empty/failure paths and exact output/side effects. Confirm the shared logic represents the same policy before merging. |
| Generator or streaming simplification | Observe partial consumption, error timing, order, identity, and no eager reads beyond demand. A list-equality test alone can miss these regressions. |
| Dead code | Establish absence of supported consumers, exports, registration and dynamic discovery. Run affected loading/registration and consumer checks; do not delete solely on a local search result. |
| Error handling or guard removal | Establish the actual input contract and supported failure behavior. Verify exceptions, status/result mapping, and retry/cleanup effects rather than hiding errors or special-casing test input. |
| State/lifecycle/structural refactor | Obtain the design decision first. Cover state ownership, concurrent/interleaved paths, startup/teardown and preserved callers at the boundary that owns them. |
| Performance simplification | Establish equivalent results and relevant resource/computation changes. Measure timing/allocation claims with a suitable representative check; fewer lines are not a speed measurement. |

## Baseline and failure handling

Use disposable data and existing offline checks when they can establish the claim. Do not access user data, real services, install dependencies, or rewrite shared environment state without authorization. Add focused characterization checks if the contract is not already locked. Record actual commands, outcomes, and environment limitations separately from intended checks.

A failing baseline needs attribution: do not weaken a test or change its expected results to make cleanup look safe. If the failure affects the contract being changed, resolve the baseline or report the blocker before risky work. For an unrelated failure, explain the limit and use sufficient targeted evidence rather than claiming the broad suite passed. If a new failure appears after a pass, preserve its evidence and resolve that pass before starting another.

Protect existing edits by understanding ownership before changes and by undoing only changes you made. Do not use destructive repository resets, broad reverts, or whole-file replacements that erase another person's work. Do not manufacture a successful runtime transition from a saved artifact or a printed success message.

## Keep the intervention proportionate

A local duplicate can be removed without inventing a framework or invoking a full design pipeline. Conversely, fewer changed lines do not justify bypassing an authoritative state owner. Escalate a structural choice because of its consequences, not because a file or function crossed an arbitrary size threshold. If an audit finding is only a heuristic, inspect the demonstrated maintenance cost before acting; leaving justified code alone is a valid result.
