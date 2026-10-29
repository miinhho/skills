# Confirmation questions and exceptions

Use these to resolve a candidate, not as syntax rules. Follow the actual contract and execution path.

## Pass without verification

- **Conditions and loops:** Can a skipped branch or empty collection omit the required check? Independent verification elsewhere can make the conditional check optional. Require a nonempty collection only when the scenario promises items exist.
- **Assertions and return values:** Does the predicate depend on app behavior? Was the matcher invoked or the Boolean result consumed? Some framework operations already fail on an unmet condition; an explicit assertion is not always necessary.
- **Async work:** Does the runner wait for the relevant Promise, callback, task, or subprocess and observe failure? Returning a task or using runner-managed completion can be sufficient. Dispatch evidence is sufficient when dispatch is the entire contract.
- **Failure handling:** Can a catch, retry, soft failure, or exit-code wrapper convert the relevant failure to success? Expected-error tests, optional cleanup, and bounded retries that ultimately propagate failure are valid exceptions. Distinguish skipped tests from passed ones.

## Unstable execution

- Match the wait to the required completion point: acknowledgement, commit, job completion, or downstream effect. A fixed delay is suspect when it can observe too early; it can be intentional when testing time-based behavior.
- Trace shared state, reused IDs, parallel workers, ordering, and cleanup to a concrete verdict dependency. Synchronization or isolation may already protect the scenario.
- Distinguish absence at one instant from absence throughout a required interval. An immediate negative check may be sufficient after an atomic completed operation.
- Evaluate retries against the contract. A retried pass does not prove first-attempt reliability, but retrying can itself be intended behavior. A contract deadline and an infrastructure timeout are different constraints.

## Wrong target

- Correlate stimulus and observation to the intended identity, resource, environment, revision, and invocation where relevant. Check for stale records, previous jobs, broad queries, cached results, login screens, and fallback responses.
- Verify that fixtures reach the intended branch. A filtered-out record can make an absence check pass without exercising the behavior.
- Identify mocked or bypassed components. A mock can prove a local interaction contract, but cannot prove behavior inside the replaced service. Judge the stated boundary; do not require every dependency to be real.

## Insufficient result evidence

Choose evidence that proves the actual promise:

| Promise | Weaker signal | Possible confirming evidence |
| --- | --- | --- |
| Change saved | Toast or optimistic UI | Read through the authoritative interface after the required commit or consistency point. |
| Work completed | Request accepted, job ID, enqueue log | Required output or effect correlated to that job or event. |
| Command succeeded | Process started or output printed | Relevant exit status and required output/state, including child failure propagation. |
| Result correct | File exists, output nonempty, no exception | Expected content or an independently justified invariant and tolerance. |

Acceptance or immediate feedback may be the entire promise. Do not invent persistence or downstream guarantees. Use the nearest authoritative interface rather than demanding internal database access.

Check the expected answer's source. Computing expected and actual results through the same faulty transformation can hide a defect. Shared helpers are acceptable when independent fixtures or invariants still constrain correctness.

## Runtime evidence

A passing run supports only the observed scenario. Before interpreting a controlled fault, establish that it violates a sourced requirement, was exercised, and is not confounded by setup or observation errors. If the relevant check fails, it detects that fault. If the scenario passes, it misses that fault. Neither result establishes sensitivity to other faults.

Distinguish infrastructure failure from a missed behavior deadline: the former leaves the claim inconclusive; the latter can contradict an explicit timing requirement.
