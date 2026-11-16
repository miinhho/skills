# Maintenance questions

A code smell is a visible sign of a possible deeper problem, not proof of a defect. Use these questions to trace the underlying cause and its concrete maintenance cost or contract risk before recommending a change. Project contracts and justified conventions can make suspicious-looking code appropriate; leaving it unchanged is a valid outcome.

## Can a reader recover the intent?

Check whether names and control flow expose the decisions a caller needs to understand. Trace unfamiliar domain terms before calling them unclear. A long function can be appropriate when it expresses one coherent operation clearly. Investigate mixed decisions or hidden dependencies; do not split it merely because it crosses a size threshold.

Mysterious Name, Long Function, and Large Class are useful labels for these suspicions. They are not sufficient evidence by themselves.

## Does each policy have an authoritative owner?

Follow a rule from its callers to the data and state it governs. Look for independent copies that can disagree, consumers that reconstruct another module's decisions, and one policy change that requires unrelated-looking edits. Also check the opposite problem: a module containing policies with different reasons to change.

These concerns include Duplicated Code, Feature Envy, Repeated Switches, Shotgun Surgery, and Divergent Change. Similar-looking branches may implement separate policies; consolidating them can create coupling instead of removing it.

## Do interfaces carry the right guarantees?

Inspect values that repeatedly travel together, representations with scattered invariants, and navigation that exposes internal layout. State which invalid combination, unit mistake, or caller dependency the current interface permits.

Data Clumps, Primitive Obsession, and Message Chains can suggest such a problem. A short parameter list, fixed wire tag, or fluent public API can also be the right interface. Recommend a new type or boundary only when it would contain an actual invariant or dependency.

## Does an abstraction earn its cost?

For a wrapper, hook, configuration, or generic layer, identify the behavior or supported consumer that needs it. Distinguish an empty forwarding layer from a boundary that enforces access, transactions, instrumentation, or a compatibility promise.

Middle Man and Speculative Generality describe possible mismatches here. A subtype that cannot meet its promised parent contract raises a different concern, Refused Bequest: demonstrate the affected substitution rather than objecting to inheritance in general.

## Is apparently unnecessary code actually unused?

Check exported interfaces, registration, dynamic discovery, and supported external consumers before recommending deletion. Distinguish unreachable handling from an intentionally supported error path. Local search results alone do not establish that a path is dead.

Generated scaffolding deserves the same examination as handwritten code. Identify its unnecessary work or misleading contract; style alone does not establish either dead code or how it was authored.

## Do state changes preserve the caller's contract?

Trace who may change state, which transitions must happen together, and who owns resources until completion or failure. A finding needs a concrete inconsistency, stale observation, leaked lifetime, or other affected behavior. If repair changes ownership or public guarantees, recommend a design decision rather than silently selecting an architecture.

## Would the available evidence detect a regression?

Compare the promised consumer result with what a check actually observes. Identify a missed failure path, an expected result inconsistent with the contract, or a substituted boundary before criticizing test style. Separate source conclusions, reported results, and observations made in this audit.

For every actionable concern, explain its location, mechanism, impact, confidence, and correction risk. Consider the counterexample in which the current code is justified. Valid outcomes include a local fix, further investigation, a design decision, or no change.
