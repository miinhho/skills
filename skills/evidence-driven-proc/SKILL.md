---
name: evidence-driven-poc
description: Design, run, and interpret a minimal PoC for an uncertain software design or behavior claim. Use when an assumption needs executable evidence, a controlled comparison, a scenario probe, or a limited real-world check before further implementation. Do not use for ordinary feature implementation or for literature review alone.
---

# Evidence-driven PoC

Use executable evidence to reduce one consequential design uncertainty. 
The result is a bounded conclusion, not a reason to redesign every adjacent layer.

## Frame the experiment

Inspect the actual implementation, existing tests, benchmarks, and validation record before proposing new machinery.

State:

- the single claim being tested;
- the observable outcome that would support it;
- a realistic counterexample or result that would weaken it;
- the system boundary and variables held constant;
- what the experiment cannot establish.

Prefer a comparison that isolates the mechanism. 
Do not compare systems with different responsibilities on a metric that inherently favors one of them.

## Choose the cheapest sufficient evidence

Use the lowest layer that can answer the claim. 
Escalate only when the lower layer leaves the relevant uncertainty unresolved.

1. Use a focused deterministic test for invariants and state transitions.
2. Use a deterministic multi-step scenario trace for lifecycle and interaction behavior.
3. Use a controlled comparison or ablation under the same inputs, resource limits, and configuration to isolate one mechanism's effect.
4. Use a small real integration, user, device, model, or service run only for behavior that deterministic fixtures cannot represent.
5. Use broader samples, environments, implementations, or repeated trials only when the claim is about robustness or generality.

Passing one layer does not prove a claim owned by a higher layer. 
A successful mechanism test does not prove task quality, and a live smoke test does not prove general robustness.

## Build the probe

- Exercise the real boundary under question when practical. Do not build a parallel toy architecture that omits the disputed behavior.
- Add only the fixture, instrumentation, or adapter needed to observe the outcome. Surface relevant inputs, transitions, selections, outputs, and cost.
- Keep controls comparable. Fix seeds, resource limits, ordering, dependency versions, configuration, and input data when they could confound a comparison.
- Define independent expected evidence before running. Do not treat the system's own output as ground truth.
- Reuse a probe as a regression scenario only when it protects durable behavior; otherwise remove or absorb exploratory machinery after learning from it.

## Diagnose before redesigning

For an unexpected result, localize it before proposing a redesign:

- implementation defect: code violates the intended contract;
- experiment defect: fixture, control, metric, or expected evidence is invalid;
- infrastructure defect: a dependency, toolchain, parser, timeout, credential, or runner failed;
- policy or configuration limitation: the mechanism works, but its operating choices are poor;
- hypothesis counterexample: the intended mechanism itself does not produce the claimed behavior under the tested conditions.

Fix experiment and infrastructure defects before interpreting a score. 
Do not add abstractions, heuristics, special cases, or optimization merely to make one fixture pass.

## Conclude at the demonstrated scope

Report:

- claim and experiment boundary;
- control and intervention;
- command or procedure actually run;
- observations and relevant cost;
- failure classification, if any;
- verdict: supported, counterexample found, or inconclusive;
- exact scope of the verdict and the next unresolved uncertainty.

Separate deterministic guarantees, empirical observations, and interpretation.
Update any durable evidence record only with work that was actually run and inspected.
