---
name: design-intent-review
description: Independently review a proposed module design against the user's goal and intent before implementation planning.
---

# Design intent review

Read the original request, relevant repository evidence, and the proposed design. Work in a separate reviewer context from the designer. Review the design itself before planning or implementing the change.

Answer these questions with concrete evidence:

1. Does the proposed behavior solve the user's stated problem and preserve the intended scope?
2. Does each module have a clear responsibility, interface, and state owner?
3. Does the design reuse the existing source of truth and logic where appropriate?
4. Can the acceptance cases demonstrate the behavior through stable interfaces?
5. Which material uncertainty or tradeoff should the user see before work proceeds?

Report to the user in plain language: goal, proposed module changes, why this design serves the goal, testable outcomes, and any decision requiring their input. Classify findings as `blocking`, `advisory`, or `none`, and cite the request or code evidence behind each finding. A blocking finding returns the design to its author with a specific correction. An advisory finding informs implementation planning.

The review is complete when the user can judge the design's intent without reading the implementation plan. Do not claim code quality, test coverage, or E2E success at this stage.
