# Skills

Reusable skills for working with coding agents. Use them to define project working agreements, design module responsibilities and state ownership before implementation, review design intent, and test uncertain assumptions.

Each skill's `SKILL.md` defines when to use it, the procedure to follow, and what to include in the result. Choose the skills that fit the task.

## Available skills

| Skill | When to use it | Main output |
| --- | --- | --- |
| [compose-agents-md](skills/compose-agents-md/SKILL.md) | Setting up a project or updating its persistent working agreements | An `AGENTS.md` section tailored to the repository while preserving existing guidance |
| [module-design](skills/module-design/SKILL.md) | Designing module boundaries before implementing requested behavior | A design covering responsibilities, public interfaces, state ownership, dependencies, and acceptance cases |
| [design-intent-review](skills/design-intent-review/SKILL.md) | Independently checking whether a proposed design serves the user's goal | Findings grounded in evidence, classified as `blocking`, `advisory`, or `none` |
| [evidence-driven-poc](skills/evidence-driven-poc/SKILL.md) | Gathering executable evidence for an important design assumption or behavior claim | A minimal experiment, observations, a verdict, its scope, and remaining uncertainty |

## Usage examples

Point your agent to the relevant `SKILL.md` and provide the task goal and target repository.

**Compose project working agreements**

> Follow `skills/compose-agents-md/SKILL.md` to organize this repository's AGENTS.md. Check the existing guidance, then show which rule fragments apply and why.

**Design modules**

> Follow `skills/module-design/SKILL.md` to design task cancellation. Identify the owner of cancellation state and the caller-facing interfaces in the current code, then document the design and acceptance cases before implementation planning.

**Review design intent**

> Follow `skills/design-intent-review/SKILL.md` to review this design. Use a separate reviewer context from the designer, check the original request and repository evidence, and identify any mismatch with the goal.

**Test an assumption**

> Follow `skills/evidence-driven-poc/SKILL.md` to test the assumption that no further state changes occur after task cancellation. Run a minimal experiment at the actual state transition boundary and distinguish what the results establish from what remains unverified.

## Using the skills together

Use `compose-agents-md` to define persistent project working agreements. For an individual feature, use `module-design` to produce a design, then use `design-intent-review` to check it against the user's intent before implementation planning. Revise the design if the review identifies a blocking finding.

When design or review exposes an assumption that needs executable evidence, use `evidence-driven-poc`. Feed the results back into the design and keep conclusions within the conditions and scope actually tested.

## AGENTS.md rule fragments

`compose-agents-md` selects and adapts the following fragments to the target repository's needs.

| Fragment | Coverage |
| --- | --- |
| [Documentation and comments](skills/compose-agents-md/references/fragments/docs-comments.md) | Explain API guarantees, errors, side effects, and ownership; keep agent working records separate |
| [GitHub work history](skills/compose-agents-md/references/fragments/github-history.md) | Link work to its Issue and PR or commit; record design changes, verification evidence, and unresolved review findings |
| [Module ownership](skills/compose-agents-md/references/fragments/module-ownership.md) | Identify caller-facing interfaces and state owners; reuse existing behavior in the owning module |
| [Verification](skills/compose-agents-md/references/fragments/verification.md) | Run appropriate checks for changed behavior and required repository checks; report results and anything left unverified |

Verify project-specific commands and paths in the target repository. Preserve manually maintained guidance and place rules that apply only to a particular module in that module's instruction file.
