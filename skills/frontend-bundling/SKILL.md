---
name: frontend-bundling
description: Diagnose frontend build and artifact loading problems and review bundling changes. Use when the issue involves entry points, module resolution, loader or plugin transforms, differences between the dev server and production builds, static asset or chunk paths, client environment variables, HMR versus full reloads, code splitting or tree shaking, or library formats used by consumers. Do not use when the issue is limited to React state or rendering rather than building or loading modules.
---

# Frontend Bundling

Trace which inputs lead to which modules and artifacts, and verify what the runtime actually loads. Identify the first stage where the failure appears and change only the settings for that stage.

## Establish the context

- Determine whether this is an app or a library and identify the broken user flow or consumer contract. Packages in the same workspace can use different settings.
- Inspect package scripts, the lockfile, and active configuration to identify the actual bundler and version, framework wrapper, relevant plugins, working directory, and target runtime. Do not infer defaults or configuration keys from the tool name alone.
- Distinguish the dev server, development-mode builds, production-mode builds, and local serving of production artifacts. Record the mode, environment, URL, and entry point for the reproduction and how they differ from the working case. Dev server behavior is not evidence about production artifacts.

## Find the first point of failure

Trace `entry point → module resolution → transform → output → load` to connect actual files and requests. Use this sequence as a diagnostic map. Depending on the tool, a transform can introduce new module references, and plugins can intervene at several stages.

1. **Entry point:** Identify which HTML file, source file, or package entry point the active configuration uses.
2. **Module resolution:** Find the file that imports the failing reference and the module actually selected. Different aliases, extensions, or conditions in package `exports` can make the same name in source code resolve to a different file.
3. **Transform:** Identify which loader or plugin rules applied to the resolved file. Distinguish a failure to find a file from a failure to parse a file that was found.
4. **Output:** Check that the actual artifacts match the references in HTML, manifests, or package metadata. The output directory on disk is separate from the browser's base URL for static assets.
5. **Load:** For apps, distinguish document, asset, and API requests and responses. For libraries, verify which file each declared consumer environment selects and executes when it loads a public package path.

Read only the reference relevant to the symptom.

- For build errors, asset paths, public environment values, the dev server, and HMR, see [Diagnose builds and loading](references/build-and-load.md).
- For the effects of code splitting and tree shaking or for library consumer contracts, see [Chunks and library artifacts](references/optimization-and-library.md).

## Report the change and what was verified

Do not edit files if asked only for analysis or review. If verification is authorized, use existing tools in an isolated local environment and check only the affected path. Do not assume that the request authorizes dependency installation, access to external services, deployment, or package publication. If no browser or report is available, state only what the source and supplied artifacts support, and describe what still needs to be observed and what result to expect.

Connect the observed symptom and evidence to the failing stage, the smallest change, and the behavior to verify under the same conditions. Distinguish checks you ran from checks you only proposed. A change in chunks or code is not evidence of a reduction in size or load time. Do not claim savings without comparable production artifacts and measurements of the metric in question.
