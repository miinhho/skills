# State and Lifecycle

## Distinguish State, Events, and Synchronization

- If a value can be derived from current props and state, and **changing when it is computed and exposed does not change the existing contract**, compute it during render. For example, if a list derived from `items` and `filter` can appear at the same time as before, it does not need separate state or an Effect to synchronize it. But if the contract hides a value in server HTML and on the first client render and reveals it only after hydration, preserve that visibility condition even if the value can be computed during render. Separate computation from display, and do not merge state with different lifetimes, such as a draft the user edits and a value committed on submission.
- Start work that happens once in response to a user action in its event handler. If the work depends on DOM nodes created by that event, wait until React has committed the target. For example, open the input in the event handler, but do not try to focus an input that does not yet exist immediately after `setOpen(true)`. Preserve the existing Effect or ref wiring that focuses the node once it is ready, and check that re-renders do not steal the user's focus. Do not move form submission into a button-click-only handler; preserve existing duplicate-submission prevention, cancellation, and error propagation. Keep ongoing synchronization of the latest state with an external widget or subscription in an Effect, and verify both setup and cleanup.
- Split independent external synchronization only when its actual rerun conditions differ.
- Remove `useMemo` from cheap boolean, string, or number calculations when it provides no practical benefit. Before removing memoization of objects, arrays, or callbacks, check consumer dependencies, subscriptions, and reference comparisons. Do not rely on memoization or React Compiler for correctness. Verify any claimed performance gain under relevant conditions.

## Check State Before and After Extracting Components

React preserves or resets state based on a component's position, type, and `key` in the render tree. Moving an input beneath a variant of a different type when a branch switches can change its value, focus, or subscription lifetime. Preserve resets when they are part of the existing contract. If the contract calls for preservation, keep state at a stable boundary. If you use Context, check both how far the value is shared within a tree and whether multiple instances remain isolated.

Before cleaning up ref forwarding, check the supported React versions and the existing consumer contract. React 19's `ref` prop is not a drop-in replacement compatible with React 18. `useContext` is still valid in React 19. Do not slip a version migration into cleanup.

## What to Check with Real Consumers

- **Render timing and commit:** If the first time a value appears is part of the contract, distinguish server HTML, the first client render, and what is shown after hydration. When an event creates DOM, check that focus moves to the target once it is ready following the action and that subsequent re-renders do not move focus back.
- **Forms and selection UI:** Check whether values and focus survive a re-render or mode switch after editing. Choose relevant scenarios from keyboard submission, canceling and reopening, and errors and call counts on failure.
- **Events and subscriptions:** Observe required setup, teardown, and calls when the component mounts, when relevant values change, and when it unmounts. State conditions that affect the outcome, such as whether Strict Mode is enabled.
- **Public components and Hooks:** Use existing callers to check the affected contracts for props, return values, defaults, public refs, and failure behavior. Do not claim that type checking alone verifies focus or call timing.
