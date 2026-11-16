# Evaluating code-designer

Use the repository evaluation format: provide the skill, selected local method, case prompt, and declared `files` in a fresh executor context. Keep `expected_output` and `assertions` with the evaluator, not the executor. A design-and-review case needs a separate reviewer context when available; record actual dispatch and reviewer output. If unavailable, grade honest disclosure, not fabricated independence. Review-only cases already position the executor as a fresh non-author reviewer and must not start by regenerating the supplied design.

## Case families

- **1–5:** responsibility/interface design: shared concurrent admission; polling lifecycle and stale responses; additive UTC range; genuinely new reminders with external contract gaps; durable deletion and evidence boundaries.
- **101–105:** supplied-design review: retry ownership; competing draft authorities; acceptable local presentation design; reversible unmeasured optimization; incorrect acceptance oracle with correct proposed algorithm.
- **201:** explicit independent-review unavailability control.

The first two families retain the independent synthetic scenarios, declared inputs, expected outcomes, and substantive assertions of the public module-design and design-intent-review evaluations. Review IDs have a separate range to avoid collisions. Executor prompts explicitly select generation versus review-only. The complete old methods are local references, not compatibility skill entry points.

## Optional offline observations

From the repository root:

```text
node skills/code-designer/evals/fixtures/progress-lifecycle/inspect-lifecycle.mjs
python -B skills/code-designer/evals/fixtures/outbox-review/observe_retry.py
```

These execute fixture behavior; they do not grade the design or grant implementation permission. The lifecycle probe uses controlled promises and fake clocks. The retry probe uses only local in-process objects. Do not require a real service to establish these deterministic claims. If an executor does not run a probe, it must not report its output as observed.

Grade each assertion against both artifact and action trace. In particular, distinguish credible planned acceptance from observed tests, reject unsupported guarantees and wrong oracles, and accept proportionate designs or `none` reviews without manufacturing new modules or blockers. There is no packaged model/evaluation runner in this repository; the host supplies fresh contexts and assertion grading.
