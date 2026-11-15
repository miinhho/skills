# Context memo

Save and resume workspace-scoped work state for the [context-memo skill](../../skills/context-memo/SKILL.md). The CLI stores the request, requirements, phases, tasks, evidence, and next action in a JSON document.

It does not plan work, verify evidence, call a model, or replace an agent's context.

## Requirements

- Node.js 22.22.2+, 24.15.0+, or 26+.
- The single bundled executable: [`skills/context-memo/scripts/context-memo.cjs`](../../skills/context-memo/scripts/context-memo.cjs).
- Git when selecting a workspace inside a Git checkout or worktree.

No global installation, adjacent `node_modules`, or runtime configuration files are needed. The executable includes its dependencies and third-party license notices.

## Start or resume work

Set `CLI` to the executable's absolute path and `WORKSPACE` to the project directory:

```sh
CLI="/absolute/path/to/skills/context-memo/scripts/context-memo.cjs"
WORKSPACE="/absolute/path/to/project"

node "$CLI" list --workspace "$WORKSPACE"
node "$CLI" load --workspace "$WORKSPACE" --work catalog --view current
```

For a new work, copy the [v1 document example](../../skills/context-memo/assets/state.example.json) to a writable JSON file and adapt it to the request. Its `workId` must match `--work`.

```sh
node "$CLI" save --workspace "$WORKSPACE" --work catalog \
  --expect missing --file "/absolute/path/to/state.json"
```

Use `--expect missing` only to create a record that does not exist. Omitting `--file` reads UTF-8 JSON from stdin.

## Update an existing work

```sh
node "$CLI" load --workspace "$WORKSPACE" --work catalog --view full
```

The response contains `{workId, workspace, path, revision, state}`. Edit the complete `state` document, not the response envelope, and save it with the returned `revision`:

```sh
node "$CLI" save --workspace "$WORKSPACE" --work catalog \
  --expect REVISION_FROM_LOAD --file "/absolute/path/to/state.json"
```

`revision` is the SHA-256 of the exact saved bytes. Use it for every update, including memo-only changes. It is separate from `state.spec.revision`, which versions the binding request and requirements.

## Commands and output

| Command | Output |
| --- | --- |
| `list` | A work-ID-sorted array of `{workId, path, revision}`. |
| `load --work ID` | The full JSON response described above. |
| `load --work ID --view current` | Markdown with the binding request, requirement statuses, selected work, remaining obligations, and next action. |
| `save --work ID --expect missing\|SHA256` | Acknowledgement containing `{workId, workspace, path, revision}`. |

Run `node "$CLI" COMMAND --help` for flags. The current view is selective: use a full load when you need omitted task history or supporting evidence.

## Document rules

Keep the complete v1 shape shown in the example. Unknown fields and versions are rejected.

- IDs and references must agree, dependencies must be acyclic, and selected work must be unfinished. At most one phase and task may be active.
- Completed or cancelled items, met requirements, and withdrawals need recorded evidence or a decision. The CLI checks its presence, not its truth.
- Retain existing requirements and unfinished tasks. Record withdrawal or cancellation explicitly rather than silently removing them.
- Change `spec.revision` when the binding request, constraints, requirement identity/text, or withdrawal contract changes. Progress and evidence updates alone do not require a new specification revision.

## Storage and privacy

Without an override, records use the platform's private user-data directory, outside the target checkout. `--store DIRECTORY` overrides `CONTEXT_MEMO_HOME`, which overrides that default.

Records are namespaced by the canonical workspace path. Checkout subdirectories and realpath aliases share a namespace; linked worktrees and separate clones do not. Branch changes do not select a different work. Moving a checkout changes its namespace; there is no automatic migration.

Work IDs contain 1–80 lowercase letters, digits, underscores, or hyphens and start with a letter or digit. Storage is plaintext, not encrypted or team-synchronized; do not save credentials. A custom store is a trusted filesystem location, not a sandbox against hostile path replacement.

## Handle failures

Success data goes to stdout. Errors go to stderr as `{error:{code,message,details?}}`.

| Exit | Meaning | Next action |
| --- | --- | --- |
| 0 | Success, help, or version | Use the returned acknowledgement before treating a save as persisted. |
| 1 | Invalid input/state, corruption, or I/O failure | Inspect the diagnostic; do not replace corrupt data with defaults. |
| 2 | Requested work not found | Confirm the workspace and work ID before creating a new record. |
| 3 | Revision conflict | Reload and reconcile; do not blindly retry the old document. |
| 4 | Lock held or ownership compromised | Do not delete another writer's lock; reload before reconciling an uncertain save. |

Rejections before publication preserve the saved bytes. A lease compromise or release failure can be reported after publication, so a failed save is not proof of rollback. Load the actual state and revision before retrying.

## Build from source

From this repository's root:

```sh
npm --prefix tools/context-memo ci
npm --prefix tools/context-memo run build
```

For code boundaries, formatting, linting, tests, and generated-file rules, see [AGENTS.md](AGENTS.md).
