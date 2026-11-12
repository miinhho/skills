# Adaptable issue templates

Use the target project's current template first. The structures below are original syntheses of public issue-template patterns, not reproductions of particular issues or conversations. They are starting points: keep questions that help explain the work, remove optional sections that add nothing, and leave no unfilled instructions in the final draft.

## Small, self-contained issue

Use a few paragraphs when the problem, desired change, and benefit can be explained without separate sections. Do not expand a simple request into a design document.

```markdown
# [Specific problem or desired capability]

[What happens or is difficult today, including the relevant situation.]

[What should happen instead and why it helps. Include a small example or constraint if it makes the difference clearer.]
```

This can fit a small bug or improvement. For bugs that need reproduction details, use the next structure rather than compressing away useful evidence.

Pattern references: [short feature-or-problem request](https://github.com/cli/cli/blob/trunk/.github/ISSUE_TEMPLATE/submit-a-request.md). A [feature template with no body prompts](https://github.com/sharkdp/bat/blob/master/.github/ISSUE_TEMPLATE/feature_request.md) also illustrates that elaborate sections are not universal intake requirements; it does not supply a substantive outline.

## Bug report

Use when observed behavior differs from what should happen. A minimal input/output example may replace a sequence of UI or command-line steps.

```markdown
# [Affected behavior and failure]

## Problem
[What goes wrong, where it occurs, and the practical impact.]

## Reproduction
[Known starting conditions and the smallest available steps, input, or reproducer link. Do not manufacture missing details.]

## Actual result
[What happens, including the relevant error or output.]

## Expected result
[What should happen instead. Explain the expectation if it is not obvious.]

## Relevant context
[Affected version, platform, configuration, or supporting artifact when known and useful.]
```

If the problem paragraph already makes the actual result unambiguous, combine those sections. A screenshot supports an explanation; it does not replace one. Include only relevant environment details, and sanitize diagnostics before including them. Unknown root cause does not prevent a useful report.

Omit optional context sections when they contain no useful information. Do not fill them by listing absent attachments, unspecified details, or unfinished investigation. Keep necessary author-facing questions separate from the public issue.

Pattern references: [compact bug form](https://github.com/AppFlowy-IO/AppFlowy/blob/main/.github/ISSUE_TEMPLATE/bug_report.yaml), [separate actual and expected results](https://github.com/microsoft/PowerToys/blob/main/.github/ISSUE_TEMPLATE/bug_report.yml), [reproduction and diagnostic prompts](https://github.com/sharkdp/bat/blob/master/.github/ISSUE_TEMPLATE/bug_report.md), and [steps with a sensitive-data warning](https://github.com/keepassxreboot/keepassxc/blob/develop/.github/ISSUE_TEMPLATE/bug_report.yml).

## Feature or improvement request

Use when the main question is what should become possible or improve, rather than whether an existing contract is broken. A proposed mechanism is optional; the need and desired outcome should stand on their own.

```markdown
# [Requested capability or improvement]

## Problem and use case
[What task is difficult or unsupported today? Describe a concrete situation and why it matters.]

## Desired outcome
[What should become possible or work differently?]

## Example and benefit
[An example of the desired behavior and how it helps the affected user or workflow.]

## Constraints and alternatives
[Relevant guarantees, current workarounds, or alternatives, if they inform the decision. Omit this section otherwise.]
```

Combine use case and benefit when they would repeat the same information. Do not require population estimates, mockups, or an implementation plan. Retain a meaningful constraint or tradeoff even when it makes the issue longer.

Pattern references: [expected behavior plus usage scenario](https://github.com/microsoft/PowerToys/blob/main/.github/ISSUE_TEMPLATE/feature_request.yml), [use cases and user impact](https://github.com/AppFlowy-IO/AppFlowy/blob/main/.github/ISSUE_TEMPLATE/feature_request.yaml), and [summary with optional example and motivation](https://github.com/keepassxreboot/keepassxc/blob/develop/.github/ISSUE_TEMPLATE/feature_request.yml).

## Behavior best shown by an example

Use for a transformation, parser, formatter, conversion, or other behavior where a small example establishes the difference more precisely than a long narrative.

```markdown
# [Unexpected transformation or missing behavior]

[Relevant version, options, or invocation context, if needed.]

## Input
[Smallest useful input.]

## Actual output
[Observed output.]

## Expected output
[Desired output.]

## Why
[Explain the intended rule, use case, or consequence.]
```

Use fenced code blocks for exact inputs and outputs. Preserve meaningful whitespace and options. Explain why the expected result is desirable rather than treating a preference as self-evident. A minimal script, snippet, or reproducer link may be sufficient; do not require a complete reproduction repository in every case.

Pattern references: [input/output/expected/why template](https://github.com/prettier/prettier/blob/main/.github/ISSUE_TEMPLATE/formatting.md) and [integration template accepting different reproduction forms](https://github.com/prettier/prettier/blob/main/.github/ISSUE_TEMPLATE/integration.md).

## Larger scoped work

When the preceding structures cannot explain a change safely, add only the sections the reader needs:

- **Background:** Context needed to understand the goal or existing arrangement.
- **Proposed work:** A candidate approach and why it addresses the problem; distinguish decisions from suggestions.
- **Constraints and scope:** Behavior to preserve, dependencies, compatibility, and explicit exclusions.
- **Completion or verification:** Observable outcomes, relevant boundaries, and checks that distinguish success from an incomplete change.

For a coverage task, describe the scenarios, important failure paths, and evidence the checks must establish. Do not invent product defects to justify missing coverage. Completion conditions should add observable criteria rather than repeat the scope list.

A [separate design-proposal template](https://github.com/cli/cli/blob/trunk/.github/ISSUE_TEMPLATE/submit-a-design-proposal.md) illustrates that detailed design can be a separate project workflow. Its label gates, design system, and mockup requirements are not general requirements for ordinary issues. The optional sections above are an authoring adaptation, not a claim that all referenced projects use a task template.

## Adapting without importing intake machinery

Carry over useful questions, not product-specific commands, dropdown taxonomies, label rules, assignees, known-incident notices, or diagnostic upload procedures. A Markdown prompt and a form field enforced as required are different; honor the target project's actual requirements rather than treating every upstream question as mandatory everywhere.

If a requested field is unknown, answer honestly or ask for essential information outside the draft. Do not invent facts to complete the shape. Look for an existing issue when relevant, but do not claim a duplicate search was performed unless it was.
