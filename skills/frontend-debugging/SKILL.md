---
name: frontend-debugging
description: Use when rendering, input, or focus behaves unexpectedly in a browser or in-app WebView, data is intermittently wrong, or errors or slowdowns follow a screen transition. Trace input through to the visible result, isolate the point of failure, and reproduce the same failure before making a minimal fix and checking for regressions. Use for runtime symptoms with an unclear cause, but route the work to the appropriate task if it already centers on build artifacts, loading configuration, or the UI's accessibility contract. Do not use for code cleanup without a symptom or for general implementation.
---

# Frontend debugging

## 1. Diagnose: Find the first boundary where behavior diverges

- Put the basis for the expected behavior alongside the actual result. Distinguish user reports, direct observations, facts confirmed in the source, and hypotheses. A clean console does not prove that behavior is correct, and the last stack frame or warning is not necessarily the cause.
- Map only the path relevant to the symptom. For example, compare signals along `user input → browser event → handler → request → state update → rendered result`. Narrow the gap between the last point where the contract held and the first point where it failed. For each observation, record a detail, such as an input value or request ID, that ties it to the same run.
- Choose the next observation that will distinguish competing hypotheses. To tell “the response was wrong” from “the right response was applied incorrectly,” compare each request's response with the state update that actually occurred.

## 2. Reproduce: Isolate the same failure

- Define the signal that identifies the reported failure (for example, a result that does not match the current selection, a missing event, or a callback from a closed view), the initial state, the interaction sequence, and when to observe the result. Record any conditions that could change the outcome, such as version, build mode, device, cache, data, or navigation history.
- When possible, start with the original user path and remove components one at a time. Check that the same outcome, the boundary needed to explain it, and the failure signal all remain. If ordering is a possible cause, control response completion, navigation, or mount transitions instead of using fixed waits. Treat an experiment that removes native browser behavior or the host boundary as a partial check of that hypothesis, not as a full reproduction.
- Change only one variable between the failing case and the passing control. If both the data and runtime environment changed, do not attribute the difference to one cause. If you cannot reproduce the failure, record which conditions you checked and which were missing. Do not conclude that the failure did not occur.

## 3. Fix: Correct the behavior where the contract was broken

Make the smallest safe change at the boundary that owns the confirmed cause. For example, if a late response is applied incorrectly, fix the rule that determines which responses may update state. If an observer outlives its view, tie cleanup to the lifecycle that registered it. Do not hide symptoms by increasing timeouts, retrying arbitrarily, or ignoring errors. If only a workaround is possible, say what behavior it preserves or sacrifices and whether it addresses the cause.

## 4. Prevent regressions: Leave a check that catches the failure

Under the same reproduction conditions, verify that the old behavior fails and that the fix preserves the user-visible result or the resource lifecycle contract. Also check the passing control or affected neighboring flows. A narrow check may suffice for pure logic, but if actual focus or the host lifecycle caused the failure, verification must include that boundary. If automation is difficult, leave a manual regression procedure with the environment, steps, and expected results. Remove temporary instrumentation and keep only the signals needed to catch the same failure in any retained tests or logs.

## References by symptom

- If clicks do not reach their target or keyboard input, focus, or navigation breaks, read [DOM, input, and focus](references/browser-interaction.md). Compare WebView hosts only when the symptom depends on the embedded app environment.
- If stale data appears, requests are duplicated, resources persist after a screen transition, or the UI feels slower, read [Data flow, lifecycle, and performance](references/state-lifecycle-performance.md). When several boundaries are involved, start with the observation that can distinguish the hypotheses.
- If evidence points to an artifact problem involving chunks, static assets, or module loading, verify how the build inputs relate to the generated artifacts and actual request URLs. Delegate this analysis to `frontend-bundling` if available. If verification centers on exposed names, roles, or states, or on keyboard or assistive technology behavior, `frontend-accessibility` can handle it. If no sibling skill is available, still report what you observed at the current boundary and what to check next. Do not hand off solely because development and production builds behave differently or the symptom involves keyboard input.

## Execution scope and reporting

A diagnosis request does not authorize editing files or interacting with a live service. When running checks, stay within authorized targets and prefer existing tools and isolated state. Keep user data and secrets out of logs and captures. If the runtime environment or device is unavailable, distinguish what the source and supplied records establish, which boundaries remain unverified, and what to observe next. Report the reproduction conditions, the evidence for the cause, the change or proposal, and any regression checks actually performed and their limitations.
