# Chunks and library artifacts

Delaying when code loads and removing code altogether are separate goals. Choose package output formats to match the consumer contract, independently of an app's initial loading strategy.

## Defer chunks beyond the initial load

**Prepare:** Define the cost you want to reduce. For an initial screen, record the target URL, the start and end of the initial load window, and the user action to take afterward. Gather the relationships between entry points and chunks in the current production artifacts, along with a request trace for that window.

**Options and limits:** A narrowly scoped `import()` boundary can defer a heavyweight feature that the initial screen does not use. If the same module also enters the initial graph through a static reference, or if preload or prefetch requests the chunk early, splitting the file may not reduce the initial transfer. If duplication is the issue, identify which modules actually appear in more than one output before considering a shared chunk. Moving all dependencies into one large shared chunk can cause unnecessary initial requests or request waterfalls.

**Verify:** Use the tool's build report, metafile, or artifact references to see where the module ends up and whether it is initial or async. Compare when the chunk is requested using the same initial URL and user action. Check that the deferred feature works on first use and when the user returns to it, and that load failures follow the existing contract. Chunk count and total output size alone do not show whether initial requests decreased.

## Remove unused code

**Prepare:** Identify the entry point in use, the package file that actually resolves, the module format the bundler sees after transformation, and the code or modules that remain in the output. Look beyond JavaScript for imports that matter for their side effects, such as CSS, polyfills, and registration modules.

**Options and limits:** First consider how to preserve statically analyzable ESM (`import` and `export`) through to the consumer's build. A named import in source does not guarantee that unused code can be removed: the resolved file may be CJS, or a transform may convert it to CJS. Even in ESM, code that is used or has side effects when evaluated may remain. Before setting `sideEffects: false` for an entire package or annotating a call as pure, check how the tool interprets the declaration and whether it is safe to skip evaluating the file or invoking the call. Side-effect exceptions must match the artifacts consumers actually select, not just source paths.

**Verify:** Check that the expected modules or code were removed from artifacts built in the same production mode. Minification can change names without removing code, so do not infer removal from a string search or an unused marker alone. Also check that features in use and required side effects (such as applying styles or running registration code) still work through the actual consumer path.

### Conditions for comparing size and load time

Keep tools and versions, target, mode, environment values, minification and source map settings, and input paths the same across the before and after production builds, apart from the intended change. Specify whether you are comparing total output size, the size of initial requests for a particular entry point, or cumulative size through the point when the feature has opened. Do not mix raw bytes, bytes compressed the same way, and transfer sizes observed in the browser. For browser comparisons, hold the route, cache state, and sequence of actions constant. To compare load times, also match network conditions and the measurement window. If you cannot match the conditions, report only the structural changes you observed and the measurements still needed.

## Verify the formats declared for consumers

**Prepare:** Identify the supported consumers and scope from the package's public contract. Compare the `package.json` `exports` and subpaths, applicable `main`, `module`, and `types` fields, `type` and file extensions, and external dependency declarations with the list of files actually included in the package. Cover only the formats and runtimes the package declares. If the declaration is unclear, do not infer the scope of compatibility.

**Options and limits:** If a public path points to the wrong format or a missing file, fix the artifact or its mapping. Node.js ESM `import`, CJS `require`, and browser modules and global scripts are different contracts. Do not add CJS, a global format, or UMD by convention if consumer environments do not require it. If a dependency is excluded from the bundle, the consumer environment must be able to provide it in the declared way. A smaller artifact may simply shift the cost to the consumer.

**Verify:** If execution is authorized and an existing local setup is ready, use an isolated consumer environment that sees only the files that will be included in the actual package. Import by package name and declared subpaths rather than referencing the source directly. For every declared format, check which JS file is selected and call an actual public function. If the contract includes types or CSS, also check type checking and stylesheet loading in the consumer. A successful build or an import that works inside the monorepo is not enough to establish that the package works for consumers. Verification does not require publishing externally.
