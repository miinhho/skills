---
name: module-design
description: Design module responsibilities, interfaces, and verification for a scoped coding task before implementation planning, grounded in the task context and available system evidence.
---

# Module design

Use the task context and available system evidence to decide what should change, where it belongs, and how to judge the result.

Scale the artifact to the decisions involved. A change within an existing module may need only a short rationale, affected interface, and acceptance cases. Do not invent modules or interface changes to fill out a design.

## Understand the context and existing system

Read the original request and relevant project vocabulary, documentation, tests, and design decisions. Establish the desired outcome, why it matters, and the constraints and guarantees that must remain true. Treat a suggested solution as a proposal to evaluate against that context.

Where relevant code exists, trace behavior through actual entry points, callers, implementations, and dependencies. Read enough surrounding code to explain how the parts cooperate and which constraints affect the design. Where implementation is absent, use requirements and external contracts to identify responsibilities and interfaces that need to be designed. Make that absence explicit rather than inventing an existing structure.

Establish existing responsibilities where evidenced, and distinguish proposed responsibilities for new parts:

- the responsibility each part fulfills in the larger behavior and what its callers rely on;
- the rules, state, and lifecycle decisions it owns, and what it delegates;
- the interface and dependency boundaries through which other parts cooperate with it;
- the constraints that explain the current arrangement, where documented or otherwise evidenced.

Infer responsibilities from behavior, contracts, and usage, not names or directory layout alone. Distinguish the implemented arrangement from the intended contract and from historical rationale. If they disagree, record the discrepancy without assuming either is automatically correct. Consult relevant history when that discrepancy or an unexplained constraint could change the design; do not invent an original intent.

Keep consequential claims tied to source material or observed results. Separate reported information, observed facts, hypotheses, and proposed choices. For an assumption that affects a decision, state its impact, how and when to check it, and how the decision would change if it proves false. Resolve it before commitment when proceeding would create an unacceptable risk or costly reversal; otherwise include the check at the appropriate implementation stage.

## Derive the change from that understanding

Explain which responsibilities, behavior, or interactions must be introduced or changed to achieve the desired outcome. Reuse existing boundaries where they fit; justify new or changed boundaries through the responsibilities and contracts they serve.

Place decisions and behavior with the module responsible for them. Reuse existing logic at its owner, keep each affected piece of state under a clear owner, and avoid making callers depend on another module's internal details. Favor small interfaces that contain substantial behavior. Describe responsibilities and interfaces before and after where they change, including effects on callers, dependencies, and compatibility guarantees.

Choose the smallest coherent change that achieves the goal across the affected paths. Small line count alone does not justify a location or scope. Explain a material alternative when it would change the decision, and keep optional cleanup outside the required change.

## Define evidence of success

Derive acceptance cases from the goal and required contracts, independently of the proposed implementation. Identify the responsible interface or boundary where each claim can be verified. Explain what evidence would distinguish success from a plausible unsuccessful change and establish relevant preserved behavior. Match the evidence to the claim; behavioral, structural, and performance claims may require different observations.

Choose the narrowest boundary that can establish the claim. Separate planned checks from commands and results actually observed, and state what the evidence cannot establish.

Present a concise design artifact connecting the goal, relevant context, responsibility and interface decisions, and acceptance evidence. Include supporting references and how remaining uncertainties will be handled. Leave implementation tasks to a later planning step.
