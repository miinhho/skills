# Skills for coding agents

Task-focused skills for designing changes, checking evidence, managing ongoing work, and writing reader-facing prose, issues, or pull requests. Each skill provides its own instructions and supporting material.

## Available skills

| Skill | Use it when you need to |
| --- | --- |
| [compose-agents-md](skills/compose-agents-md/SKILL.md) | Set repository working agreements in `AGENTS.md` without overwriting local guidance. |
| [code-designer](skills/code-designer/SKILL.md) | Design responsibilities, interfaces, and acceptance evidence, then independently review the design. |
| [code-audit](skills/code-audit/SKILL.md) | Diagnose existing code or a change against standards, requirements, and maintenance risks without editing it. |
| [code-cleaner](skills/code-cleaner/SKILL.md) | Perform scoped, behavior-preserving cleanup with appropriate before/after verification. |
| [react-cleaner](skills/react-cleaner/SKILL.md) | Simplify React components and hooks without changing their consumer contracts. |
| [frontend-debugging](skills/frontend-debugging/SKILL.md) | Reproduce frontend failures, isolate their causes, and verify focused fixes. |
| [frontend-accessibility](skills/frontend-accessibility/SKILL.md) | Implement or review semantic UI, keyboard behavior, and focus contracts. |
| [frontend-bundling](skills/frontend-bundling/SKILL.md) | Diagnose frontend build pipelines and verify emitted artifacts in their intended consumers. |
| [evidence-driven-poc](skills/evidence-driven-poc/SKILL.md) | Run a focused experiment to resolve a consequential assumption. |
| [e2e-verify](skills/e2e-verify/SKILL.md) | Verify a workflow or assess whether end-to-end tests prove their claims. |
| [context-memo](skills/context-memo/SKILL.md) | Maintain ongoing work in OMP across phases, requirement changes, interruptions, or fresh contexts. |
| [issue-authoring](skills/issue-authoring/SKILL.md) | Prepare an actionable GitHub or Jira issue before publication. |
| [pr-authoring](skills/pr-authoring/SKILL.md) | Write or review a pull request description against the actual change and requirements. |
| [writing](skills/writing/SKILL.md) | Compose clear, accurate, natural prose from the first draft, or revise and review existing writing without losing meaning or voice. |

## Use a skill

1. Choose a skill from the table and read its `SKILL.md`.
2. Copy that skill's complete directory into your agent's supported skill location, or give the agent the path to its `SKILL.md`. Keep linked references and bundled resources with it.
3. Supply the task, target repository, constraints, and relevant evidence. A skill does not grant permissions or capabilities that the agent lacks.

For example, with this collection accessible to the agent:

> Use `skills/code-designer/SKILL.md` to design resumable imports for the inventory project. Preserve the existing input format and ground the design in the current implementation.

Check each skill's compatibility notes before use. Some skills require a specific runtime; context-memo uses OMP's notebook and context-replacement tools.

For writing guidance throughout your work, add a reference to `writing/SKILL.md` in the persistent instructions your agent actually loads, using its installed path. Ask the agent to apply it while composing reader-facing prose, including issue and PR descriptions, alongside any document-specific skill. Automatic skill selection depends on the host; the description alone does not guarantee activation. No separate polishing call or external model is required.

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for skill layout, evaluation data, and contribution guidance. Scoped [AGENTS.md](skills/AGENTS.md) covers skill authoring.
