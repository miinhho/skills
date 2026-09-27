---
name: compose-agents-md
description: Compose a project's AGENTS.md from selected reusable rule fragments and repository-specific facts without overwriting local guidance.
---

# Compose AGENTS.md

Use this at project setup or when the project's working agreements change. Read the available [rule fragments](references/fragments/) and inspect the target repository's existing instruction files first. Select only rules that should apply persistently in that repository; project-specific commands and paths must come from the repository itself.

1. Show the selected fragments and why each applies. Check the existing `AGENTS.md`, nested instruction files, and skills for duplicate or conflicting guidance. Keep project facts and invariants in AGENTS.md; keep task methods in skills and pass one-off task scope through the Task Graph.
2. Compose the selected fragments into one short root `AGENTS.md` section. Adapt wording to the project; do not insert unresolved placeholders or commands guessed from its language. A specialized rule for one module belongs in that module's nested `AGENTS.md` or `AGENTS.override.md`.
3. Preserve manually maintained sections. If a generated section already exists, update only that section. Mark its fragment IDs and source revision so reruns are reviewable.
4. Validate the result for contradictions, duplicates, broken file references, and unnecessary always-loaded text. Report the final instructions and which optional fragments were left out.

The root file is a persistent working agreement, not a full workflow engine. The harness still owns graph transitions, gate evaluation, worktree ownership, and recorded outcomes.
