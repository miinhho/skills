# Skills

Reusable skills for coding agents: set project rules, design and review changes, test assumptions, assess workflow evidence, and author issues and pull requests.

Each skill's `SKILL.md` explains when to use it, how to approach the task, and what to return.

## Available skills

| Skill | Use it to |
| --- | --- |
| [compose-agents-md](skills/compose-agents-md/SKILL.md) | Compose project working agreements from reusable rules and repository facts while preserving existing guidance. |
| [module-design](skills/module-design/SKILL.md) | Define responsibilities, interfaces, and acceptance evidence before implementation planning. |
| [design-intent-review](skills/design-intent-review/SKILL.md) | Independently assess whether a proposed design serves the goal and respects existing boundaries. |
| [evidence-driven-poc](skills/evidence-driven-poc/SKILL.md) | Design and run a focused experiment to resolve a consequential assumption. |
| [e2e-verify](skills/e2e-verify/SKILL.md) | Review end-to-end test evidence or verify a specific workflow with existing tools. |
| [issue-authoring](skills/issue-authoring/SKILL.md) | Draft, revise, or review an actionable GitHub or Jira issue before publication. |
| [pr-authoring](skills/pr-authoring/SKILL.md) | Draft, revise, or review a pull request description grounded in the actual change and project requirements. |

## Use a skill

Make this collection available to your agent. Point it to the selected `SKILL.md`, identify the target repository, and supply the task context.
Paths in the example are relative to this collection.

For example, with a target repository supplied:

> Follow `skills/module-design/SKILL.md` to design resumable imports for a local inventory tool. Preserve the existing input format. Use the current implementation to identify responsibilities, interfaces, and acceptance evidence before implementation planning.

Follow links inside the selected skill for its references and supporting material.

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for skill-writing conventions, evaluation data, and the contribution process.
