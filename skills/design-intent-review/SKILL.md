---
name: design-intent-review
description: Independently review a proposed module design for alignment with the user's goal, task context, responsibility boundaries, and acceptance evidence before implementation planning.
---

# Design intent review

Review the proposed design before implementation planning, in a separate reviewer context from the designer.

Read the original request and relevant project context. Independently inspect available code, callers, tests, and contracts that bear on the design's consequential claims; the proposed design is not its own evidence. Where implementation is absent, evaluate proposed responsibilities against requirements and external contracts. Distinguish observed implementation, required contracts, and evidenced historical rationale. State missing material that limits the review.

Answer these questions with concrete evidence:

1. Does the design understand the user's desired outcome, the background that matters to it, and the guarantees that must remain true? Has it mistaken a suggested solution for the requirement?
2. Does its account of the available system match the evidence? Are existing and proposed responsibilities clearly distinguished, including state and lifecycle ownership, delegation, and caller expectations? Would an omitted path or constraint change the decision?
3. Would the proposed behavior and interactions produce the desired outcome? Challenge assumptions or alternative explanations that could break that connection.
4. Does the change belong with the responsibility it serves? Check for duplicated rules, competing state owners, leaked internal details, and responsibilities shifted to callers without justification. Are retained or changed interfaces and boundaries justified by the goal and existing constraints?
5. Is the scope sufficient and proportionate across affected callers and dependencies? Are deliberate contract changes explicit and preserved guarantees accounted for? Wider restructuring needs a reason tied to the goal.
6. Can the acceptance evidence establish the actual claimed outcome and relevant preserved behavior through appropriate boundaries? Expected results must come from the goal or contract, and observations must distinguish success from a plausible unsuccessful change.

Scale scrutiny to the consequences of the decisions. Check that evidence fits the claim and that planned checks are distinguished from observed results. For unresolved assumptions, assess the impact, validation timing, and response if false. A feasible check during implementation can be sufficient when the decision remains safely reversible.

Report the goal, proposed responsibility and interface decisions, why they serve the goal, testable outcomes, and material limits or choices. Classify findings as `blocking`, `advisory`, or `none`, citing the violated requirement or evidence, impact, and specific correction. Blocking findings return the design to its author; advisory findings inform implementation planning.

Block when the proposed design cannot achieve the goal, violates a required contract, or lacks a credible way to establish its claimed outcome. An unresolved assumption blocks commitment when the design has no supported basis without it, or deferring validation creates an unacceptable risk or costly reversal. Missing execution alone is not a blocker. Keep resolvable code questions with the designer; ask the user only for a missing requirement or material choice that available evidence cannot settle.

The review is complete when the user can judge the design's intent without reading the implementation plan. Do not claim code quality, test coverage, or E2E success at this stage.
