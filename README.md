# Skills for coding agents

Task-focused skills for designing changes, checking evidence, managing ongoing work, and writing issues or pull requests. Each skill provides its own instructions and supporting material.

## Available skills

| Skill | Use it when you need to |
| --- | --- |
| [compose-agents-md](skills/compose-agents-md/SKILL.md) | Set repository working agreements in `AGENTS.md` without overwriting local guidance. |
| [module-design](skills/module-design/SKILL.md) | Define responsibilities, interfaces, and acceptance evidence before planning implementation. |
| [design-intent-review](skills/design-intent-review/SKILL.md) | Independently review whether a design serves its goal and respects module boundaries. |
| [evidence-driven-poc](skills/evidence-driven-poc/SKILL.md) | Run a focused experiment to resolve a consequential assumption. |
| [e2e-verify](skills/e2e-verify/SKILL.md) | Verify a workflow or assess whether end-to-end tests prove their claims. |
| [context-memo](skills/context-memo/SKILL.md) | Maintain current work state across phases, requirement changes, interruptions, or fresh contexts. |
| [issue-authoring](skills/issue-authoring/SKILL.md) | Prepare an actionable GitHub or Jira issue before publication. |
| [pr-authoring](skills/pr-authoring/SKILL.md) | Write or review a pull request description against the actual change and requirements. |

## Use a skill

1. Choose a skill from the table and read its `SKILL.md`.
2. Copy that skill's complete directory into your agent's supported skill location, or give the agent the path to its `SKILL.md`. Keep linked references and bundled resources with it.
3. Supply the task, target repository, constraints, and relevant evidence. A skill does not grant permissions or capabilities that the agent lacks.

For example, with this collection accessible to the agent:

> Use `skills/module-design/SKILL.md` to design resumable imports for the inventory project. Preserve the existing input format and ground the design in the current implementation.

The instructions are not tied to a single agent runtime. Check the selected skill's compatibility notes before using features that require tools or host integration.

## Context memo CLI

`context-memo` includes a [Node.js CLI](tools/context-memo/README.md) for saving and loading personal work state. Its bundled executable needs no npm installation. Other skills do not require this tool.

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for skill layout, evaluation data, and contribution guidance. Scoped `AGENTS.md` files cover [skill authoring](skills/AGENTS.md) and [context memo development](tools/context-memo/AGENTS.md).
