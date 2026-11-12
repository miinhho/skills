# Contributing

Contributions change how agents approach tasks. Explain the behavior you want to improve and use evaluation cases to show the difference.

## Skill layout

Each skill lives in `skills/<skill-name>/`. Keep its entry point at `SKILL.md` and preserve existing entry paths when revising a skill.

| Path | Purpose |
| --- | --- |
| `SKILL.md` | The skill's trigger, task method, boundaries, and expected result. |
| `references/` | Supporting guidance linked from `SKILL.md`, when needed. |
| `evals/evals.json` | Evaluation prompts, expected outcomes, assertions, and declared input files. |
| `evals/fixtures/` | Input files for evaluation cases that need them. |

Begin `SKILL.md` with YAML front matter containing `name` and `description`. Keep `name` consistent with the skill directory. Use `description` to explain the task and when the agent must select the skill.

## Write and revise a skill

Read the current skill and its references before editing. Keep its responsibilities distinct from neighboring skills.

- Put the core task method and output requirements in `SKILL.md`.
- Link supporting detail from its owning skill instead of copying it into repository documentation or another skill.
- State consequential boundaries, such as review versus execution and drafting versus publication.
- Ground instructions in the task's evidence needs. Avoid arbitrary word limits, fixed section counts, or universal document templates.
- Preserve useful technical rationale and constraints when removing repetition.
- Keep examples independent of private conversations and identifying project histories.

Use the [skill catalog](README.md#available-skills) to find the relevant entry point. For example, [compose-agents-md](skills/compose-agents-md/SKILL.md) owns rule-fragment selection and adaptation. Its fragment links remain there. The issue and PR authoring skills own their writing references and review checklists.

Keep the README focused on discovery and first use. Update its catalog when a skill's purpose or entry path changes. Keep task-specific methods in their owning skill, not in this guide.

## Evaluation format

Each `evals/evals.json` contains a top-level `skill_name` string and an `evals` array. The name identifies the skill under evaluation. Each case contains these fields:

| Field | Content |
| --- | --- |
| `id` | A numeric case identifier, unique within the file. |
| `prompt` | The task and context supplied to the performing agent. |
| `expected_output` | The intended behavior or result, not mandatory wording. |
| `files` | An array of input file paths, or an empty array when no files are needed. |
| `assertions` | An array of statements used to judge the artifact and actions. |

Resolve entries in `files` relative to the skill directory, not the evaluation file. For example, a fixture under `evals/fixtures/` uses that prefix in its declared path.

Construct prompts and fixtures as independent synthetic scenarios. Do not reuse private conversations, real contribution histories, or recognizable retellings with substituted names. Define expected outcomes from the intended behavior, not from the agent output you hope to approve.

Cover both the behavior being changed and relevant behavior that must remain intact. Assertions must accept sound alternatives rather than require one preferred phrase or document structure. Make execution requirements and safe test boundaries explicit in cases that need them.

## Run and interpret evaluations

The repository contains evaluation data, not a packaged evaluation runner. Use a setup that can supply the skill, references, prompt, and declared files separately from grading material.

1. Retain the source revision and original output for the behavior under investigation.
2. Run each case in a fresh context with the skill, relevant references, prompt, and declared input files.
3. Keep `expected_output` and `assertions` out of the performing agent's input. Use them to grade the resulting artifact and actions.
4. For cases that change state, use a disposable copy and follow the case's isolation and cleanup instructions.
5. Capture actual commands, observations, and outputs for cases that require execution.
6. After revising the skill, rerun affected cases and relevant control cases. Compare the observed behavior with the intended change.

An execution case is not complete with a proposed probe or source-only analysis. Distinguish a skill failure from an invalid fixture, runner failure, or unavailable dependency. Correct the evaluation setup before treating its result as evidence about the skill.

Case text does not authorize dependency installation, real-service access, or user-data access. Obtain separate user authorization for those operations. Keep remote publication and other state-changing operations within the user's explicit authorization.

Report only work actually performed. Separate source analysis, planned checks, observed results, and remaining uncertainty. If execution was not possible, state the specific missing prerequisite rather than claiming that the case passed.

## Submit a contribution

Keep the change focused on the demonstrated problem. Update the owning skill, its affected references and evaluation cases, and any repository links changed by the contribution.

Describe the resulting behavior and why it helps users or reviewers. Include relevant evaluation evidence and limitations without replacing the explanation with a work log. Do not imply that checks ran, actions were authorized, or remote content changed unless that happened.
