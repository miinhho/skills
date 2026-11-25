# Component Structure Patterns

Before introducing new names, find **where code changed recently or needs to change now, and why**. Trace the call site, then the state owner, event and failure handling, and finally the rendered output. Keep rules that must change together in one place, and put independently changing policies behind boundaries that let each remain unaware of the other's implementation. The patterns below are options for observed problems, not a prescribed sequence or a required architecture.

| Observed structure | Pattern to read first |
| --- | --- |
| Policy calculations or behavior are buried in presentation code | S1. Separate Calculation and Behavior from Presentation |
| An intermediate layer forwards props it does not use | S2. Compose at the Call Site |
| Flags appear independent, but valid combinations or execution paths differ | S3. Separate Execution Paths and Variants |
| Distant UI parts need the same state and transitions | S4. Use One Owner and Keep Composition Scoped |
| Unrelated state and work live in one Hook just because they are the same kind of thing | S5. Split Responsibilities by Reason for Change |
| Similar presentation is mixed with domain policy, obscuring the boundary for reuse | S6. Separate Shared Contracts from Domain Policy |

## S1. Separate Calculation and Behavior from Presentation

- **Signal:** A presentation change requires reading validation, calculations, and timers, or multiple views reimplement the same interaction rules.
- **Approach:** Extract calculations that produce the same result for the same input into pure functions. When needed, group behavior whose state, events, and cleanup share a lifecycle in a Hook, and return only the values and actions consumers need. Leave rendering the actual elements and wiring their events to the presentation layer. Wrapping a pure calculation in a Hook or exposing all internal setters and DOM details does not narrow the boundary.
- **Counterexample:** Leave behavior in place when it is brief, used by one view, and changes with the presentation. If separating logic from a widget whose roles and keyboard or pointer interactions are linked would cause consumers to miss required wiring, let the shared component own that contract.
- **Check:** Compare results for the same input, the start, cancellation, and end of interactions, timer and subscription cleanup, and keyboard and pointer paths as relevant.

## S2. Compose at the Call Site

- **Signal:** An intermediate component forwards values it does not use, and a change to the leaf API forces edits through the intermediate layers.
- **Approach:** If the intermediate component only handles layout, pass children the caller can already create as `children`. Use named slots when multiple positions are actually replaced independently. If presentation needs items, indices, or active state created internally, keep a contract that passes the data, such as `renderItem(item, state)`. Do not replace simple prop forwarding with global Context.
- **Counterexample:** Explicit props make responsibilities clearer when the intermediate component uses those props itself. Short forwarding paths with no practical cost are also fine. Do not build a slot API in advance for layout that does not need interchangeable parts.
- **Check:** At actual call sites, compare the default UI, slot positions and data, existing event values and order, element identity, and focus.

## S3. Separate Execution Paths and Variants

- **Signal:** Mode-specific branches cut across rendering, events, and Effects, and the call site does not show which flag combinations are valid.
- **Approach:** Keep simple presentation differences that share the same behavior as small conditions or value mappings. If mutually exclusive modes share a flow, consider an explicit mode or a discriminated union. If actions and state lifetimes really differ by mode, branch once at the boundary and compose only the parts each variant needs. Keep inputs or subscriptions that must persist across variants with a stable owner.
- **Counterexample:** Do not turn independent state like `disabled` into a mode based on the number of flags. Do not duplicate all JSX and policy just to remove a few branches. Changes to public props require separate approval.
- **Check:** Check calls for each valid mode and transitions between modes. Confirm that values, focus, and subscriptions do not reset where the same instance previously persisted, and that they do reset where existing behavior requires it.

## S4. Use One Owner and Keep Composition Scoped

- **Signal:** Multiple parts synchronize copies of the same state, or input, preview, and action components far apart in the tree share the same transitions.
- **Approach:** Give the state and transitions one owner and compose the parts at the nearest common boundary using props and callbacks directly. Consider an instance-scoped Provider and compound components only when several parts really need flexible placement and intermediate forwarding recurs. The root owns state and transition rules; the parts convey intent, such as open, select, or commit. If a consumer actually swaps out how values are stored, expose a minimal contract for values and actions rather than internal implementation details.
- **Counterexample:** Values with different lifetimes or commit points are not the same state. Do not merge draft and committed values or lift local state into global state. Do not build a general-purpose Provider interface in advance for one composition.
- **Check:** Render two instances together and verify that they work independently and preserve the lifecycles of opening, closing, applying, canceling, and reentering. If DOM placement or semantics exposed to assistive technology also change, check those contracts too.

## S5. Split Responsibilities by Reason for Change

- **Signal:** A module such as `usePageState` or `useData` names only a technical category and groups policies that change for different reasons. A caller needs only a few capabilities but also has to know about unrelated requests, subscriptions, or configuration.
- **Approach:** Map consumers to change scenarios instead of counting return values. Separate state and transitions that can be read and written independently, along with their policies. Keep together parts that must update atomically in one event or in a specific order, and narrow only contracts that need to be consumed independently. If existing state ownership or public boundaries would change, review call examples and contracts separately before proceeding.
- **Counterexample:** An editing flow or state machine can return several values and still be cohesive if they share a lifecycle and enforce invariants together. Do not split mechanically by form, such as one Hook per value or one service per API call.
- **Check:** Verify that changing one policy leaves other consumers' state, requests, and subscriptions alone, and that changes that must move together still occur in the same order and as the same unit.

## S6. Separate Shared Contracts from Domain Policy

- **Signal:** You want to reuse presentation, but domain requests, permissions, labels, or storage rules enter the shared component. Or exceptions for individual consumers keep accumulating after similar UI is merged.
- **Approach:** Describe the data flow at the call site first. Let the domain own retrieval, transformation, permissions, storage, and error handling, while generic UI receives a small contract such as the options, values, and actions it needs. If there are consumers to compare, extract only what they actually share in semantics, state, timing, and accessibility. If only the appearance matches, share tokens or presentation pieces. If only behavior matches, share a function or Hook. Leave duplication when sharing would increase coupling.
- **Counterexample:** If a business action and its presentation always change together, leave them together. A standard-sounding name does not give a component standard keyboard, form, or assistive-technology behavior. Do not change a UI that updates the model only on Apply into one that updates it immediately.
- **Check:** Verify that each consumer preserves the same input, commit, cancellation, error, and permission contracts. Check that changing policy in one domain does not require an exception for another after sharing the code.
