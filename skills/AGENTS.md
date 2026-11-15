# Working on skills

This file applies to `skills/`. Follow [CONTRIBUTING.md](../CONTRIBUTING.md) for the skill layout and evaluation format.

## Boundaries

- Read the affected skill's `SKILL.md` and linked references before editing. Preserve its name and entry path unless the task requires a migration.
- Put the task method in `SKILL.md`; load detailed guidance through linked references. Do not duplicate another skill's method or make unrelated skills mandatory.
- Keep host-specific behavior in an adapter or compatibility section. Do not assume every agent has OMP tools, browser access, or a particular writable destination.
- Generated helpers belong to their owning tool. For context memo, edit `../tools/context-memo/`, build there, and ship the resulting single script; do not patch the bundle by hand.

## Writing

- Write instructions for the agent performing the task and documentation for the person choosing the skill. Keep session notes, implementation chronology, and benchmark victory claims out of READMEs and skill instructions.
- Keep `name` and trigger-focused `description` in front matter. State authority, permissions, side effects, and unavailable capabilities explicitly.
- Link supporting material from its owner instead of copying it. Update the root catalog when discovery information changes.

## Evidence

- Use independent synthetic evaluation scenarios. Do not turn private conversations or identifiable project incidents into fixtures.
- Keep prompts and executor inputs separate from expected outcomes and grading assertions. Test the required result, not a preferred phrase or the current implementation.
- Use disposable state for executable cases. Report actual commands and observations; distinguish setup failures from skill failures and saved state from a completed runtime transition.

These agreements adapt the local `module-ownership`, `verification`, and `docs-comments` fragments. Their task-specific methods remain in the corresponding skills; this file does not require a new tracking workflow.
