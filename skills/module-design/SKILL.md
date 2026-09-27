---
name: module-design
description: Design module ownership and interfaces for a scoped coding task before its implementation graph is planned.
---

# Module design

Produce a design artifact for the requested behavior, grounded in the current repository. Read the relevant code, tests, project vocabulary, and existing design decisions first. Favor small interfaces that contain substantial behavior, and test through those interfaces.

Record:

- the user's goal and observable behavior;
- existing modules and interfaces the change will use;
- modules to add or alter, with each module's responsibility and public interface;
- the single owner of each affected piece of state and existing logic to reuse;
- dependencies and shared files that constrain parallel work;
- externally observable acceptance cases and the interface where each can be tested;
- uncertainties that could change the design.

Prefer a smaller interface that contains the behavior. Do not create a module solely to satisfy a diagram or split a coherent state owner across tasks. Distinguish an observed code fact from a proposed design choice.

The artifact is ready for intent review when a reviewer can trace each proposed module and test case back to the user's goal, and when every affected state and shared interface has an owner. Do not write implementation tasks yet; task decomposition follows the design review.
