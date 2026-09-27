# Module ownership

- When changing a module, identify its caller-facing interface and the owner of each affected state before editing.
- Reuse existing behavior at its owner rather than adding a second implementation of the same rule.
- Keep cross-module changes coordinated through the owning interface; record a deliberate interface change in the task design.
