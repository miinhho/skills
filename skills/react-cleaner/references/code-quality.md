# Code Quality Patterns

Before redesigning the structure, look at what intent is hard to read at call sites and which changes are scattered across multiple places. Readability, predictability, cohesion, and coupling are four ways to assess the same change. When a symptom touches several of them, choose the change that reduces the greater practical cost.

## Readability: Reading Order and Policy Placement

### Q1. Meaningful Names for Conditions and Units

- **Signal:** Readers must interpret comparisons, compound conditions, or literals themselves to work out their purpose.
- **Approach:** Give conditions and values with product meaning names that show their purpose and units. Write range comparisons so the value reads naturally between the bounds. Naming equal numbers to clarify their meanings is different from putting a shared policy in one place (Q6).
- **Counterexamples and checks:** Do not wrap obvious comparisons or conventional one-off literals. Check that adding a name does not change short-circuit evaluation, call order, inclusive or exclusive bounds, or `null` handling.

### Q2. Flatten Nested Branches

- **Signal:** Nested ternaries or repeated conditions make it hard to tell which case produces which output.
- **Approach:** Use explicit guards or ordered branches when precedence matters, and a small lookup table for mappings that only select values. If mode-specific logic cuts across rendering and events, consider [Structure Pattern S3](component-structure.md#s3-separate-execution-paths-and-variants).
- **Counterexamples and checks:** Do not rule out simple ternaries. When building a lookup table, do not eagerly evaluate functions that previously would not have run. Compare results and execution order for overlapping conditions and the default branch.

### Q3. Keep Intent Close and Show Implementation Details Only When Needed

- **Signal:** Preprocessing or integration steps obscure the purpose at the call site, or readers have to follow several wrappers that say nothing about their intent to understand a short policy.
- **Approach:** Put cohesive work that consumers do not need to know about behind a function or component with a clear purpose. Keep choices and error handling close to the call site when they are central to understanding it. Consider removing wrappers that do nothing but forward values before adding an abstraction.
- **Counterexamples and checks:** Moving code away is not necessarily abstraction, and a small amount of duplication does not justify copying an important policy. Compare where readers of two consumers have to go to follow failure, cancellation, and success paths.

## Predictability: Names and Call Contracts

### Q4. Wrappers with Familiar Names and Hidden Side Effects

- **Signal:** An apparent lookup or predicate with a name like `get` or `isValid` writes data, sends notifications, or makes additional calls. Or a wrapper shares a name with a standard or library API but has different success or failure semantics.
- **Approach:** Use a local name or an explicit action boundary that makes the actual behavior clear. Even when separating reads from writes, preserve required side effects for the appropriate existing callers. If the public contract must be kept, check whether renaming or separating the operations is within the approved scope. Until then, only present the problem and alternatives.
- **Counterexamples and checks:** Do not remove logging on the assumption that it is unrelated. Do not flag an adapter that behaves as its name suggests merely because the name matches another API. Check values, failure propagation, and the conditions, order, and frequency of side effects in existing calls.

### Q5. Align Return and Error Contracts for Peer Functions

- **Signal:** Calls with the same role and failure semantics use different representations without a clear reason, forcing each caller to write its own branching and conversions.
- **Approach:** First establish what failure means and how callers handle it. Follow the existing convention at that boundary. If callers branch on an `enum` or status code, preserve the codes and their meanings. If they handle failure through a dedicated `Error` object, preserve the error type and how it propagates. If they use `Result`, preserve its shape. Needing a reason for failure does not by itself justify a new representation. If internal representations differ, keep necessary conversions at the existing boundary.
- **Counterexamples and checks:** Simple predicates, validation failures users can correct, and failures propagated as exceptions may need different handling. Do not combine them merely to match type shapes or turn returned values into exceptions or vice versa. For actual calls, check that success and failure branches, the error codes, types, or messages consumers rely on, and existing propagation via mechanisms such as synchronous exceptions or Promise rejection are preserved.

## Cohesion and Coupling: Group Only What Changes Together

### Q6. Give a Shared Policy One Owner

- **Signal:** Changing one policy requires editing values in different files together, and missing one produces an incorrect result for users.
- **Approach:** Put the value or computation where the policy is already owned. For example, a request limit and page count calculation may share a policy if both uphold the same list contract. Look for the module that owns the meaning before reaching for a general constants collection.
- **Counterexamples and checks:** If a page size and a character limit change independently, do not group them even if the numbers match. Change the shared policy value and check that the relevant consumer results change together while independent settings stay the same.

### Q7. Keep Files That Change Together Close

- **Signal:** Changing or removing a feature always means editing its components, types, validation, and tests across directories organized by file type.
- **Approach:** Use actual patterns of joint changes and import direction to colocate the feature's private code first. Keep code that several features use under the same contract with its existing shared owner. If a file move requires changing public paths or dependency direction, check the design scope separately.
- **Counterexamples and checks:** Do not move folders just because relative paths are long or there are many files. Check that consumers, public imports, registration, dynamic loading, and test discovery still work.

### Q8. Choose What Changes Together in Form Validation

- **Signal:** Independent field rules require readers to scan other fields, or constraints such as date ordering or matching confirmation values are spread across fields and only one side gets updated.
- **Approach:** Keep rules that depend on a single input's value near the field. Keep rules for combinations of values or a single submission contract together in the form or with the domain validation owner. Do not assume that errors displayed in the UI and the policy that accepts or rejects submissions are the same thing.
- **Counterexamples and checks:** Do not move all validation into a central schema or into individual fields just because the tool or library allows it. Check independent rules, field combinations, when errors appear and clear, and successful and failed submissions.

### Q9. Leave Duplication When Separation Is Better

- **Signal:** Sharing similar-looking code increases consumer-specific options, branches, and the number of tests affected, or actual cases show that the code changes for different reasons.
- **Approach:** Let each consumer own policies that vary by consumer. If a common contract remains, reuse only the small function, style, or component that provides it. Base the decision on differences in existing requirements and call sites, not guesses about future changes.
- **Counterexamples and checks:** Do not leave a single policy deliberately duplicated when divergence would cause an error (Q6). Check whether one consumer's change requires a branch for another consumer and whether changes to the shared contract reach every consumer that needs them.
