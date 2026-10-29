# Skills

Reusable skills for working with coding agents. Use them to set project rules, design modules, review designs, test assumptions, and assess end-to-end (E2E) evidence across frontend and backend systems.

Each skill's `SKILL.md` defines when to use it, the procedure to follow, and what to include in the result. Choose the skills that fit the task.

## Available skills

| Skill | When to use it | Main output |
| --- | --- | --- |
| [compose-agents-md](skills/compose-agents-md/SKILL.md) | Setting up a project or updating its persistent working agreements | An `AGENTS.md` section tailored to the repository while preserving existing guidance |
| [module-design](skills/module-design/SKILL.md) | Designing a scoped coding task before implementation planning | A design deriving responsibilities, interfaces, and acceptance evidence from task context and available system evidence |
| [design-intent-review](skills/design-intent-review/SKILL.md) | Independently checking whether a proposed change serves the user's goal | Evidence-backed findings on intent, change rationale, scope, and acceptance cases, classified as `blocking`, `advisory`, or `none` |
| [evidence-driven-poc](skills/evidence-driven-poc/SKILL.md) | Gathering executable evidence for an important design assumption or behavior claim | A minimal experiment, observations, a verdict, its scope, and remaining uncertainty |
| [e2e-verify](skills/e2e-verify/SKILL.md) | Reviewing whether E2E tests prove their claims, or verifying a specific workflow with existing tools | Confirmed findings, evidence for each claim, and remaining uncertainty |

## Usage examples

Point your agent to the relevant `SKILL.md` and provide the task goal and target repository.

**Compose project working agreements**

> Follow `skills/compose-agents-md/SKILL.md` to organize this repository's AGENTS.md. Check the existing guidance, then show which rule fragments apply and why.

**Design modules**

> Follow `skills/module-design/SKILL.md` to design task cancellation. Identify the owner of cancellation state and the caller-facing interfaces in the current code, then document the design and acceptance cases before implementation planning.

**Review design intent**

> Follow `skills/design-intent-review/SKILL.md` to review this design. Use a separate reviewer context from the designer, check the original request and repository evidence, and identify any mismatch with the goal.

**Design and review a change to an existing system**

> Follow `skills/module-design/SKILL.md` for this change. Understand the task background and trace the relevant code, its responsibilities, and caller expectations. Derive where the change belongs, what must remain true, and how to verify the outcome. Then use `skills/design-intent-review/SKILL.md` in a separate reviewer context to check that understanding and the resulting decisions.

**Test an assumption**

> Follow `skills/evidence-driven-poc/SKILL.md` to test the assumption that no further state changes occur after task cancellation. Run a minimal experiment at the actual state transition boundary and distinguish what the results establish from what remains unverified.

**Review E2E evidence**

> Follow `skills/e2e-verify/SKILL.md` to review this workflow's tests. Look for passes without verification, unstable execution, the wrong target, and insufficient result evidence. Report confirmed findings and distinguish source analysis from executed results.

To request execution, name the workflow and target environment:

> Follow `skills/e2e-verify/SKILL.md` to verify this workflow in the local test environment. Use existing tools to establish whether an accepted job completes and produces the required output. Report the evidence and anything left unverified.

## Using the skills together

Use `compose-agents-md` to define persistent project working agreements. For a scoped coding task, use `module-design` to understand the context and available system evidence, then derive responsibilities, interfaces, and acceptance evidence. Use `design-intent-review` to independently check those decisions before implementation planning. Revise the design if the review identifies a blocking finding. Scale the analysis and artifact to the decisions involved, and schedule assumption checks according to their impact and the cost of changing the decision.

When design or review exposes an assumption that needs executable evidence, use `evidence-driven-poc`. Feed the results back into the design and keep conclusions within the conditions and scope actually tested.

Use `e2e-verify` to assess whether workflow tests prove the required behavior, or to run a focused verification. It applies across user interfaces, services, background jobs, and command-line tools. Use `evidence-driven-poc` when the main task is to design an experiment for an unresolved assumption.

## AGENTS.md rule fragments

`compose-agents-md` selects and adapts the following fragments to the target repository's needs.

| Fragment | Coverage |
| --- | --- |
| [Documentation and comments](skills/compose-agents-md/references/fragments/docs-comments.md) | Explain API guarantees, errors, side effects, and ownership; keep agent working records separate |
| [GitHub work history](skills/compose-agents-md/references/fragments/github-history.md) | Link work to its Issue and PR or commit; record design changes, verification evidence, and unresolved review findings |
| [Module ownership](skills/compose-agents-md/references/fragments/module-ownership.md) | Identify caller-facing interfaces and state owners; reuse existing behavior in the owning module |
| [Verification](skills/compose-agents-md/references/fragments/verification.md) | Run appropriate checks for changed behavior and required repository checks; report results and anything left unverified |

Verify project-specific commands and paths in the target repository. Preserve manually maintained guidance and place rules that apply only to a particular module in that module's instruction file.
