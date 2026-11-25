---
name: frontend-accessibility
description: Implement or review accessibility in web UIs. Use for HTML semantics, control roles, accessible names and states, keyboard operation and focus, form error announcements, and accessibility regressions in widgets such as tabs and modals. Do not use to investigate general UI bugs unrelated to accessibility contracts or to check visual design fidelity alone.
---

# Frontend Accessibility

Check whether users can understand and operate the interface to complete their tasks. Roles, accessible names and descriptions, states, keyboard behavior, and focus are UI contracts that can break even when the interface looks unchanged.

## 1. Check user actions and native semantics

Start by identifying the target screen, what the user needs to do, the state transitions, and the existing behavior affected. Do not infer roles from component names or appearance. Follow wrappers, slots, and conditional branches to see what actually renders. For review requests, do not edit files.

- Prefer native HTML that matches the action. Use `<a href>` for navigation and `<button>` for commands. Do not duplicate correct native roles or states with ARIA. ARIA does not implement keyboard behavior or focus management.
- Put the role and accessible name on the element the user actually operates. Use visible labels as names, and keep state in sync with actual behavior using native attributes such as `checked` and `disabled`, or ARIA appropriate to the role. Keep supplementary descriptions separate from names. Split improperly nested links and buttons into separate controls.
- Check that users can enter, navigate, act, and leave using only the keyboard, with a clear focus order and visible focus indicators. Decide where focus should go when elements open, close, become hidden, or are removed so it is not lost on a hidden element or the document body. Do not convey important meaning or errors through color or icons alone.

For labels, native controls, and form errors, read [Semantics and Forms](references/semantics-and-forms.md). To check the semantic and keyboard contracts of complex widgets or verify regressions, read [Widgets and Accessibility Contract Verification](references/widget-contracts.md).

## 2. Match the evidence to the claim

| Evidence | What it can establish |
| --- | --- |
| Source and lint results | Implementation clues such as element choice, attribute declarations, names and ID references, and handlers. Do not conclude that something is missing without understanding the wrappers or actual state transitions. |
| Rendered output and browser behavior | The actual DOM and accessibility information exposed by the browser, changes in roles, names, and states, the results of key presses, and focus and its visible indicator. Role-based queries and automated audits are limited to the tool's rules or model and the states exercised. |
| Direct testing with assistive technology | What users can navigate or operate, or what is announced, on a specific combination of operating system, browser, and assistive technology. The DOM or accessibility tree alone cannot guarantee announcement wording or timing, or behavior across all combinations. |

Verify within the permitted scope using existing tools and environments. Do not treat a passing audit as the completion criterion. Identify the inputs a user would make in the relevant states and the results to verify. For tabs, for example, check selection state, whether the previous panel is no longer exposed, and the keyboard path to the active panel rather than checking CSS classes. If you cannot run the checks, describe the actions and expected results, keeping them separate from observed results.

## 3. Make targeted changes and report the results

In reviews, connect **location and transition conditions → broken contract and evidence → user impact → minimal fix and regression checks**. Do not report a defect merely because a native element has no explicit role, a headless component supplies the semantics, or links styled as tabs navigate between pages. If you made changes, state what changed and what behavior you preserved. Report source findings, observed environments and results, and unverified behavior separately.
