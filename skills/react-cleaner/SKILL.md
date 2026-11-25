---
name: react-cleaner
description: Clean up React components and Hooks without changing their behavior. Use when reviewing or refactoring working React/TSX code with excessive Effects or derived state, components with mixed responsibilities, mode flags, prop forwarding, duplicated logic, or unnecessary abstractions. Treat new component API design, diagnosis of bugs with unknown causes, accessibility fixes, and bundle optimization as separate tasks when they are the primary goal.
---

# React Code Cleanup

Do not implement future requirements in advance. Make it easy to see where the next change belongs and what it will affect. Judge the code by **what changes for the same reason and who owns state and behavior**, not by line count or the amount of duplication.

## 1. Identify the Scope and Contracts to Preserve

Check the request scope, project instructions, supported React versions, actual call sites, and existing verification. If asked only for a review, do not edit files. If asked to clean up code, make changes only where behavior can be preserved. Do not disguise a bug fix or feature as cleanup.

Describe only the affected contracts, in concrete terms. These may include public props, exports, and refs; when input is preserved or reset; the order and frequency of submissions, cancellations, and errors; subscription setup and cleanup; and accessible names and focus. When changing DOM structure or component placement, check whether React still preserves state.

## 2. Choose the Smallest Change

- **Readability:** Are intent and control flow clear at the call site? Name complex conditions, but do not scatter simple expressions across files.
- **Predictability:** Do names, arguments, and return types describe what actually happens? Make hidden side effects explicit without removing necessary logging or synchronization or changing existing failure behavior.
- **Cohesion:** Are policies and code that must change together for the same reason in one place? Equal numbers or similar JSX do not establish that two pieces of code implement the same policy.
- **Coupling:** Does a change propagate to unrelated consumers? Examine layers that only forward props and Hooks with mixed responsibilities, but do not judge them by prop depth or the number of return values.

First consider inlining, removing unnecessary layers, or using an existing owner. If you propose a split, explain **whether it reduces the context needed to read the code** or **whether there is a contract that really needs to be shared**. Do not materially change local state ownership, public APIs, lifecycles, or module boundaries without an approved design. In a proposal, show consumer call examples and differences from the existing contract before showing new internals.

Pick a pattern that addresses the symptom and explain **which call site or change exposes the problem → why the pattern fits → what smaller alternative exists → what to verify**. Do not apply the pattern if a counterexample fits or the impact has not been established. When principles conflict, first protect shared policies whose divergence would break behavior, and do not add coupling to code that changes independently.

- For names, branches, hidden side effects, return contracts, constants, file placement, and form validation, read [Code Quality Patterns](references/code-quality.md).
- For separating UI and logic, slots, variants, compound components, Hook responsibilities, and domain boundaries, read [Component Structure Patterns](references/component-structure.md).
- For derived state, Effects, memoization, draft and committed form values, or remounting, read [State and Lifecycle](references/state-lifecycle.md).

## 3. Verify and Report the Result

Before changing state ownership or timing, observe the existing behavior. Compare before and after along paths that real consumers use. For a form, for example, do not just compare values: follow user input through submission or cancellation and check the values passed to callbacks, how often the callbacks run, and whether the input is preserved. Do not weaken existing expectations to make tests pass. If the necessary environment or baseline observation is unavailable, defer risky changes and distinguish what can be verified from what evidence is missing.

In a review, report the location, the observed problem, the affected callers, the smallest improvement, and what behavior to check. For an edit, report the actual changes and the results of checks you ran. If leaving the code alone is better, explain which contracts or reasons for change differ. Do not claim a check passed if you did not run it.
