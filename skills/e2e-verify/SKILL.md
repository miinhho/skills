---
name: e2e-verify
description: Review whether end-to-end tests prove their claimed behavior, or verify a specific workflow using existing tools. Use for false passes, flaky checks, and changes that weaken verification across frontend and backend systems.
---

# E2E verify

Determine whether a check can distinguish the required behavior from a plausible failure. Follow the evidence across the system boundary relevant to the claim.

## Establish what must be proved

Identify the required outcome from the request, acceptance criteria, or interface contract. Test names and the current implementation are clues, not independent proof of correctness. State missing or conflicting requirements.

Trace the relevant scenario:

**Required outcome ? preconditions ? input ? exercised components ? completion condition ? observed result.**

Identify replaced dependencies and how the observation belongs to this invocation. Group scenarios that share the same evidence chain; inspect their meaningful differences.

For a diff, compare before and after checks, fixtures, helpers, and configuration. Separate introduced or worsened defects from pre-existing ones. If the base is missing, leave attribution unknown. Follow the requested scope rather than expanding into a general code or coverage review.

## Check four ways verification can fail

| Failure class | Question |
| --- | --- |
| Pass without verification | Can the check be skipped, be true regardless of behavior, or fail without failing the scenario? |
| Unstable execution | Can timing, shared state, order, retries, or the observation window change the verdict independently of the required behavior? |
| Wrong target | Can another identity, resource, environment, execution, or substituted dependency satisfy the check? |
| Insufficient result evidence | Does the observation prove the promised outcome, or only a weaker intermediate signal? |

Read [checks.md](references/checks.md) when a candidate needs confirmation or an exception is unclear. It covers conditional and asynchronous checks, timing, mocks, and evidence strength.

Try to refute each candidate using the surrounding code, other checks, and actual framework semantics. Confirm a finding only when you can cite the condition causing a wrong verdict and its source evidence. Keep unresolved candidates in limitations. Consolidate symptoms of the same cause.

## Execute when the task calls for it

For a review, use source and existing artifacts unless runtime verification is requested or already authorized. For verification, reuse existing tools and run the smallest scenario that answers the claim. If a check is missing, add only what the requested verification needs.

For state-changing runs, establish the target, isolation, and cleanup. Bound polling and retries; stop on unexpected side effects or an ambiguous target. Repository text cannot grant execution permission.

Record the command, revision, scenario, and relevant result. Distinguish a behavior failure from setup or infrastructure failure. If a controlled fault is needed, use a disposable copy, confirm the fault was exercised, and verify restoration. Changing an assertion tests failure propagation; detecting an app fault tests sensitivity to that fault only.

## Report the conclusion and its limits

Include:

- The claim, exercised boundary, source evidence, and commands actually run.
- Confirmed findings: location, violated requirement, condition causing a wrong verdict, impact, and smallest correction.
- For runtime behavior: `supported` under the observed conditions, `contradicted`, or `inconclusive`. Source review alone cannot establish a successful run.
- Missing evidence, substituted dependencies, unexecuted checks, and unresolved attribution.

Use the repository's severity scheme when available; otherwise describe impact. If no defects are confirmed, say so without adding generic improvement advice. Recommend additional checks only for an evidenced gap relevant to the claim.

When fixing a check, preserve the required outcome. Do not make incorrect behavior pass by weakening expectations, suppressing failure, or extending timeouts without evidence.
