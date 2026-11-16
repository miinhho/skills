---
name: code-audit
description: Diagnose code quality, Fowler code smells, AI-generated complexity, responsibility boundaries, standards violations, and maintenance risks without editing code. Use for scoped unchanged-code audits or change/diff reviews against a fixed reference; keep Standards and Spec conclusions separate.
---

# Code audit

Inspect and recommend; do not edit source, stage changes, commit, or decide a new architecture. An audit finding is evidence for a decision, not authorization to refactor. This skill is usable alone, with local source and contracts; it needs no sibling skill or host-specific command.

## Establish the scope and mode

Identify the requested module, paths, concern, and allowed observations. Read applicable repository guidance and documented standards (including CONTRIBUTING and coding standards when present), entry points, relevant callers, tests, and contracts. Trace behavior rather than inferring ownership from names. Do not silently turn a local audit into a whole-repository rewrite.

- **Existing Code Audit:** inspect the selected current code, including unchanged lines. Trace dependencies far enough to understand actual consequences. A diff is not required.
- **Change Audit:** for a live Git repository, resolve the supplied reference to an immutable commit and capture the target identity before reviewing. Supplied immutable before/after snapshots or captured patches can also define a review; record their identities and limits without pretending they are locally resolved Git refs. If the comparison is unclear, determine whether the request means branch changes from a merge-base, a direct commit comparison, or staged/working-tree changes. Ask only when intent cannot be established from supplied context. Record exact base/target identities and comparison semantics, affected files, and relevant commits; do not keep reviewing a moving branch name. For a working tree, retain an immutable patch/snapshot that includes the explicitly requested staged, unstaged, or untracked content. Do not silently use HEAD and omit the requested work. An invalid reference or empty comparison is a scope/setup result, not a successful substantive review.

For Git, resolving refs and capturing a diff are read-only operations. A merge-base comparison such as `git diff <resolved-base>...<resolved-target>` is appropriate for branch changes, not a universal choice for all modes. Trace relevant surrounding unchanged code to establish a change's effects; distinguish preexisting problems from regressions introduced by the change.

## Review along distinct axes

**Standards:** cite the applicable documented rule and source for hard violations. Also diagnose structural and maintainability concerns using [the local smell reference](references/smells.md). Repository conventions override generic smell preferences; heuristic labels are not universal rules. Avoid duplicating formatter/linter output as human-review findings unless an actual uncovered risk matters. State when tooling was not run.

**Spec:** locate the originating issue, supplied specification, or authoritative contract. Compare required outcomes, preserved behavior, missing/partial behavior, incorrect implementations, and unauthorized scope expansion. Cite the requirement behind each finding. If no spec is available after a bounded search of supplied context and relevant repository material, report `Spec: not assessed — no spec available`; do not invent requirements or claim compliance. A user can clarify an unresolved material requirement, but lack of a tracker integration does not prevent a Standards audit.

In a change audit, keep Standards and Spec as visibly separate conclusions: either can pass while the other fails. When host capabilities allow and both reviews warrant it, use fresh parallel reviewer contexts supplied with the same fixed comparison, their evidence sources, and the relevant local reference. Otherwise inspect the axes sequentially and disclose that they were not independent executions. Parallelism is not a prerequisite. In existing-code mode, use the same separation where a spec applies; distinguish explicit contract defects from heuristic smells even when there is no spec.

## Ground and prioritize findings

Read enough code to test each consequential suspicion against callers, state/lifecycle ownership, dependency direction, and repository constraints. Separate a demonstrated defect, documented-standard breach, heuristic smell, and speculative concern. An unusual shape or an AI-like style alone does not establish impact. Do not infer dead code solely from a local text search when dynamic discovery or external consumers may exist.

For each actionable finding include:

- location (file/line or stable symbol) and supporting source/contract evidence;
- axis and problem category, distinguishing defects from heuristic concerns;
- actual or plausible impact, with the concrete affected path;
- severity and confidence, justified rather than guessed from the smell name;
- refactoring risk, affected contracts/callers, and what evidence would reduce uncertainty;
- the smallest justified next action, which may be further investigation, no change, a local cleanup, or a design decision.

Prioritize within each axis by impact and confidence, not by the number of smell labels. Do not let a clean Standards conclusion hide a Spec failure or vice versa. A recommendation can describe options and tradeoffs, but changes to state ownership, public interfaces, or responsibility boundaries remain decisions for an authorized design step, not autonomous audit commitments.

## Report

State mode, scope, fixed comparison where applicable, sources/limitations, and separate Standards and Spec conclusions. Include evidence-backed prioritized findings and verification actually performed. An honest `no actionable findings` is valid; it does not prove correctness, coverage, or merge readiness. Do not fabricate execution or modify code to demonstrate a proposed fix. Use safe observations only within authorization, and report unexecuted checks as proposals.
