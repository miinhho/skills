# Evaluating code-cleaner

Run each prompt in a fresh executor context with SKILL.md, its local safety reference, and declared input files only. Keep evals.json outcomes/assertions, `grading/`, `grade_fixture.py`, and `grade_structural_fixture.py` inaccessible to that executor. Give it a disposable project copy, not access to the evaluator's repository or withheld expected results. Observe its actual commands and edits.

All executable fixtures use installed Python 3.10+ and the standard library. No dependencies, services, network, or user data are required or authorized. Preparation refuses an existing destination, and baseline capture refuses to overwrite a file. Use new writable absolute paths for each run and keep the baseline outside the executor project. Delete only disposable state you created after grading.

## Local cleanup (case 1)

From the repository root, the evaluator prepares executor inputs:

```text
python skills/code-cleaner/evals/prepare_fixture.py <new-parcel-project>
```

The executing cleaner must run these before and after its authorized edit respectively:

```text
python <new-parcel-project>/consumer_checks.py capture <new-external-parcel-baseline.json>
python <new-parcel-project>/consumer_checks.py compare <external-parcel-baseline.json>
```

Only after the executor finishes, the evaluator runs:

```text
python skills/code-cleaner/evals/grade_fixture.py <new-parcel-project> <external-parcel-baseline.json>
```

The withheld grader compares actual real-consumer and held-out observations against an independent expected result, checks the baseline itself, checks protected inputs including the unrelated note, and rejects an unchanged subject. It does not replace reviewing the diff for meaningful simplification or the trace for real baseline/post-change execution. A changed source file or a printed success message alone cannot pass the evaluation.

## Justified structural migration (case 3)

```text
python skills/code-cleaner/evals/prepare_fixture.py <new-quote-project> quote-project
```

Supply design.txt as a synthetic approved-design/review input. Do not present that fixture narrative as a review actually executed in the current run. The cleaner captures its baseline, migrates the three authorized files, then compares:

```text
python <new-quote-project>/consumer_checks.py capture <new-external-quote-baseline.json>
python <new-quote-project>/consumer_checks.py compare <external-quote-baseline.json>
```

Evaluator-only:

```text
python skills/code-cleaner/evals/grade_structural_fixture.py <new-quote-project> <external-quote-baseline.json>
```

This grader runs the public consumers and held-out integer-rounding/category/error/input-preservation checks. It verifies protected files and removal of the obsolete named private policy helpers. The evaluator must additionally inspect that both adapters truly reuse the one policy owner rather than retain duplicate implementations or compatibility shims.

## Negative controls and grading limits

Case 2 requires design escalation before an unsupported ownership shift. Case 4 rejects mechanical smell policing under a justified convention. Case 5 explicitly withholds execution capability and should produce an honest blocker, not a pretend completed cleanup. Do not run hidden graders as executor inputs or grade setup failure as a skill failure.

A successful hidden check establishes only the tested behavior. Grade the withheld assertions against artifacts and traces too: authorized scope, meaningful improvement, direct local workflow without ritual redesign, complete structural migration, actual execution, and honest remaining limits. This repository has no packaged model runner; use the host's fresh-context evaluation mechanism around these runnable fixture commands.
