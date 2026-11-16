# Evaluating code-audit

Run each case in a fresh context with SKILL.md, the relevant local references, prompt, and declared inputs only. Withhold `expected_output` and `assertions` for grading. Capture tool actions as well as the final report: no-edit is a behavioral obligation, not just a sentence in the report. Grade no-action results where the repository convention defeats a mechanical smell recommendation.

Cases cover unchanged-code diagnosis (1), captured diff review with Standards pass/Spec fail (2), Spec pass/Standards fail (3), convention/no-spec negative control (4), unavailable fixed comparison and working-tree scope (5), and unsupported execution claims (6).

The before/after files and unified diffs are independent synthetic immutable captures. They are not actual branches or commits in this repository; an executor must not fabricate Git resolution or review the surrounding development work. For a live-Git evaluation, the evaluator must supply its own disposable repository and fixed base/target identities, including the requested staged/unstaged/untracked snapshot. Do not substitute a moving ref or HEAD-only review.

These cases are diagnostic and require no installation, external service, or execution. Source-derived behavior must be labeled as such. Use the host's fresh-context evaluation mechanism and grade the report/action trace against the withheld assertions; this repository does not ship a model runner. Assert each finding's evidence/location/category/impact/severity/confidence/refactoring-risk/affected-contracts/next-action, while accepting alternative sound recommendations and a justified absence of findings. Verify source remains unchanged through the evaluation harness rather than trusting a no-edit claim.
