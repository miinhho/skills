# Context memo development

This file applies to `tools/context-memo/`. The [README](README.md) is the user guide; keep development instructions here.

## Ownership and contracts

- Keep oclif commands responsible for parsing and output, application services for orchestration, `memo/` for work semantics, and `storage/` for filesystem and resource lifetimes.
- Parse external documents at the `Work` construction boundary. Preserve immutable documents and private plan indexes; reuse their queries instead of rebuilding state in consumers.
- Keep replacement policy in the work aggregate and error serialization at the CLI boundary. Represent business rejections explicitly; preserve diagnostic paths and all applicable rejection families.
- Preserve the v1 wire shape, exit codes, exact-byte revision checks, root precedence, and canonical checkout/worktree isolation. A snapshot revision is not a specification revision.
- Keep revision comparison and replacement acceptance inside the acquired lease. Dispose through the library's ownership-aware release. Preserve primary and cleanup failures; never claim rollback after publication or manually remove someone else's lock.

## Readability

- Give predicates, schemas, and intermediate filesystem results meaningful names. Separate decisions from I/O and mutations with logical blank lines.
- Prefer explicit guards to nested ternaries or dense compound expressions. Split functions by a real responsibility, not by individual statements.
- Declare Markdown section order in one place and render complete logical items. Avoid maintaining an evolving sequence of individual output-line pushes.
- Use Biome for mechanical formatting and import organization. Do not suppress useful diagnostics merely to make checks pass.
- Test fixture and asserted-result indexes may use non-null assertions; production code keeps that lint rule enabled. Do not replace required test actions with optional chaining that can silently skip them.

## Commands

Run from this directory:

```sh
npm ci
npm run format
npm run lint:fix
npm run check
```

`check` runs read-only format and lint checks, TypeScript, and tests against a temporary production build. It does not update the installed skill; use `npm run build` for that. Use a focused test while correcting a failure; coordinate a shared final check when several contributors are editing.

- Domain and renderer tests run in process. CLI process tests cover native argument parsing, stdin/stdout, filesystem side effects, and competing writers—not bundler internals.
- Vitest builds the executable once in a disposable directory using the production configuration and provides its path to test helpers. Do not hardcode a skill installation path in tests.
- Copied-executable tests verify the dependency-free deployment boundary. Keep assertions tied to consumer-visible outcomes and use disposable fixtures.

## Generated output

- `npm run licenses` generates `THIRD_PARTY_LICENSES.txt` from installed production dependencies. `prebuild` and `pretest` run it automatically; direct `tsup` requires generation first.
- The report is ignored generated input. tsup embeds its full notices and all runtime dependencies into `../../skills/context-memo/scripts/context-memo.cjs`.
- Keep deployment to that one executable: no adjacent package metadata, chunks, license sidecar, source tree, or `node_modules`. Rebuild rather than editing generated JavaScript.
- Keep README examples usable by readers. Record task progress and observed check results in the task conversation, not in the README or this file.
