# Select content for the review

The repository's actual template and instructions control the final structure. These are content-selection principles, not replacement headings or a universal PR template.

## Interpret prompts by meaning

| Prompt or instruction | Appropriate answer |
| --- | --- |
| Purpose, motivation, or problem | What needs attention, why it matters, and how this change addresses it. |
| Major changes | The consequential changes, organized around behavior or responsibility rather than every file. |
| Impact or compatibility | Affected users, interfaces, defaults, consumers, or preserved contracts. |
| How should this be tested or verified? | What the reader should do and what they should observe, including relevant prerequisites. |
| How did you test, checks performed, or results? | Checks actually executed and their observed outcomes, using the available records. |
| Coverage added | Scenarios and behavior the new or changed checks establish. Added tests are not themselves execution results. |
| Review focus | A specific decision, risk, or non-obvious starting point that helps the reviewer. |
| Documentation, rollout, or follow-up | Whether the actual change requires these and the relevant action, not merely whether a file was edited. |

Use explanatory text to resolve ambiguous headings such as "Testing" or "Test plan." That section may ask for instructions, evidence, or both. Do not assume its meaning from a heading alone.

For executed checks, retain the distinction between a named targeted run and a broader suite. Describe the run accurately rather than claiming more or adding a routine disclaimer about every unperformed check. If a required results field has no run record, say so plainly there; do not manufacture a result.

For verification instructions, include the working directory, environment, command or interaction, and expected observation only as needed. Do not write a setup tutorial when existing project instructions and one command suffice. Preserve sequence when earlier actions establish the state needed by later checks. Do not invent commands to fill a field.

A question that asks only for instructions should not acquire a historical-results paragraph. If the template asks for both, distinguish the two. Missing records need an answer in a required results field, not a routine notice appended to proposed verification or rollout instructions. A supplied source note need not appear in the draft.

## Choose detail according to the change

### Focused correction

Explain the incorrect behavior and the resulting correction. Include the relevant trigger or mechanism if it is needed to understand the fix. Do not expand the description with an artificial alternatives discussion or an unnecessary architecture overview.

### Feature or behavior change

Connect the user need to the new behavior. Name important preserved behavior. A representative input/output or usage example can make the difference clearer than several paragraphs. Include only examples and captures actually available or clearly proposed as future verification.

### Contract or compatibility change

Name the affected API, data shape, configuration, permission, storage, or command-line contract. Explain relevant old and new behavior, supported consumers, and necessary migration or rollout order. Do not compress these distinctions into a vague improvement claim. A small interface example or version matrix may help when it clarifies actual interactions.

### Broad or cross-cutting work

Explain the organizing decision and why the breadth is necessary. Point to a useful review starting point when the diff is difficult to navigate. Do not turn that guidance into an exhaustive file list or generic instructions on how to review code.

### Documentation, maintenance, or coverage work

Describe what the work enables, corrects, or protects. Do not imply application behavior changed when the diff only changes documentation or tests. Explain meaningful coverage rather than listing test-function names. Keep the description proportionate without discarding the purpose.

## Be precise without defensive prose

A sentence should explain the change, answer a project question, support a claim, or help a review decision. Missing information is not automatically content for the body.

Qualify the claim itself when needed. Do not manufacture an expansive interpretation and then deny it. Do not surround a simple, supported observation with warnings about unrelated properties it never claimed to establish.

Keep a real limitation when it affects the stated benefit, compatibility, measurement, or use. Do not add a separate limitations section by habit. Likewise, do not hide a relevant constraint merely to sound confident or fit a short paragraph.

When revising, remove the irrelevant sentence rather than summarizing away the neighboring rationale, examples, or guarantees. Avoid self-evaluation adjectives, repetitive assurances, progress reports, and descriptions of how the draft was produced.

## Public references and their scope

- [Google: Writing good CL descriptions](https://google.github.io/eng-practices/review/developer/cl-descriptions.html) explains what changed, why, and context useful to future readers. Its title conventions describe a particular review culture, not a universal prefix or length rule.
- [GitHub: Helping others review your changes](https://docs.github.com/en/pull-requests/concepts/helping-others-review-your-changes) emphasizes purpose, approach, relevant review guidance, and self-review.
- [Warp: write-pr-description](https://github.com/warpdotdev/common-skills/blob/8792394ff1b655e0af451b8fabb68ef0cfcbd208/.agents/skills/write-pr-description/SKILL.md) explicitly prioritizes repository templates and connects descriptions to reviewer decisions. Its default sections, style prescriptions, and execution instructions are not defaults of this skill.
- [Sentry: pr-writer](https://github.com/getsentry/skills/blob/main/skills/pr-writer/SKILL.md) selects explanation according to change type and uses reviewer aids conditionally. Its title conventions, command restrictions, and publication workflow are repository-specific rather than requirements here.
- [Cloudflare: pull-requests](https://github.com/cloudflare/computer/blob/812bce58d2ea3735c12e6f6181c269c4010293df/.agents/skills/pull-requests/SKILL.md) distinguishes actionable manual verification from testing strategy. Its no-headings and mandatory shortening rules do not override a target project's template.

Use public examples to understand content choices, not to canonize an author's omissions or copy an unrelated project's format. Follow the target project's current policies when preparing an actual contribution.
