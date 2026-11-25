# Diagnose builds and loading

Start with the first error or failed request. Do not try to fix a build error by changing an asset URL or fix an incorrect browser request URL with a module alias.

## Entry points, module resolution, and transforms

**Prepare:** Gather the active configuration for the same workspace, the modes that succeed and fail, the full text of the first build error, and the file that imports the reference. If there is a working path, compare which configuration and files each path selects.

| Symptom | Where to look first and what to change | What to verify |
| --- | --- | --- |
| A page or package entry point is missing from the graph | Check the module script tag in the active HTML, the configuration for multiple entry points, and the script that selects the configuration. If the entry point is wrong, fix only that connection. | The output includes the target entry point and its required dependencies, and the other entry points remain connected. |
| `Module not found` appears, or the same name points to a different file | Check the path relative to the importing file, letter case, extension, active alias, and the package's public `exports` and active conditions. A type checker that resolves the path does not prove the bundler uses the same alias. | The failing reference resolves to the intended file and yields the same result on the target OS and runtime. |
| The file is found, but TS, JSX, CSS, or another format cannot be parsed | Identify which transform rules cover the file's extension and path. Check the order of loaders and plugins and the conditions that determine where they apply. Pinpoint which rules apply to the failing file before broadening a rule. | The original failing mode emits the expected JS, CSS, and assets, and they load. Check TS syntax transformation and type checking separately as needed. |

Importing package internals directly or allowing every path and extension through alias or transform rules can bypass public boundaries or select a different file. Record where the failing path diverges from the working one before making a change.

## Output paths, asset base URLs, and environment values

**Prepare:** From the production output, find the HTML, manifest or runtime references, and actual output files that belong to the same build. Check the document URL and the failed request's URL, request type, response status, and body type. If an environment value is involved, identify which configuration reads it and when. Do not collect or quote secrets.

- **Output files and asset URLs:** If the file exists on disk but the browser requests a different path, trace where the asset URL is generated. For example, if the app opens under `/reports/` but requests a chunk at `/assets/panel.js`, compare the generated reference with the path where the file is actually served. Fix the asset base URL setting for the tool and version (for example, Vite's `base` or webpack's `output.publicPath`) or correct the faulty reference. If the file is missing from the output, determine why the build should emit it before changing the base URL.
- **Load failures that look successful:** A `200` response with an HTML body for a JS request does not mean the script loaded. Check for an incorrect URL or an HTML fallback response. If the HTML and chunk may come from different builds, first compare the hashes and references.
- **When environment values take effect:** Distinguish process environment values read by the build configuration, public values substituted into client code at build time, and public configuration the browser actually reads at runtime. Values substituted at build time cannot change without rebuilding the artifacts. If the same files must work in several environments, first check for an existing runtime configuration contract. Values sent in client artifacts or browser responses are public regardless of filenames, prefixes, or compression. Keep secrets on the server.
- **Independent paths:** The asset base URL locates build assets such as JS and CSS. It may have the same value as the API URL or the router base path, but do not assume changing one setting changes the others. Do not assume the production artifacts have the dev server's proxy or base path.

**Verify:** Open the HTML from the same build at the relevant base path. Check that the initial JS and CSS and the async chunks needed when opening the feature load from the correct URLs with the expected response types. If you changed an environment value, check the public value in the artifact or verify that the browser reads the runtime configuration as expected. Check the API request URL separately.

## HMR, full reloads, and missing updates

**Prepare:** Gather the active dev server and client configuration and versions, the changed file, the screen that uses it, the server's change detection logs, and the browser console and network records. Make one edit to a module already loaded on the screen and trace what happens.

- **The server did not detect the change:** Check that the file you edited is the one the server actually serves and that it is in a watched path.
- **The server detected the change but did not notify the browser:** Check the dev server notification and the browser connection. A detection log or socket connection alone does not prove that module replacement succeeded.
- **The browser received the notification but did not replace the module:** Check whether the updated module loaded and whether the module or its importer has a boundary that accepts the update. HMR replaces modules without reloading the document. If the update is not accepted, the tool and configuration determine whether the browser falls back to a full reload or leaves the update unapplied. Live Reload fetches a new document and restarts the page. A full reload alone does not prove that file watching failed or that HMR was disabled.

**Verify:** Apply the same small edit and check together whether the content changed, whether the browser requested a new document, and what the update messages and module requests or replacement records show. Do not judge HMR success solely by whether state persisted. Do not fix component state preservation or rendering errors themselves here.
