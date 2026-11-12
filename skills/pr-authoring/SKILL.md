---
name: pr-authoring
description: Draft, revise, or review pull request titles and descriptions from the actual changes and project requirements. Use when preparing a PR description, answering a repository's PR template, refreshing a stale body, or reviewing a draft before submission. Answer each question according to its meaning, preserve review-relevant detail, and keep writing separate from execution and publication.
---

# PR authoring

Write for reviewers who need to understand the change and decide whether it should merge. Explain the purpose, resulting behavior, and decisions that matter; do not substitute a file inventory, work log, or defense of the author's process.

## Establish the artifact and project requirements

Identify whether the request is for a new draft, a focused revision, or review findings. Resolve the target repository, base and head, language, and output format from available context. Ask only for missing information that materially affects the artifact and cannot be obtained from project sources.

Read the applicable PR template, including its instructional comments, conditional fields, checklists, and machine-readable markers. Select the requested template when several exist; otherwise use the project's applicable default. Read contribution guidance, including authorship and AI-use policies. The project's instructions take precedence over this skill's defaults.

Do not carry a template or house style over from another repository. Keep required headings and their order, follow instructions about optional sections, and preserve functional markers. Distinguish author-facing instructions from content intended to remain in the submitted body. Do not invent a title prefix, character limit, line-wrapping limit, or mandatory section set.

## Understand the change before describing it

Inspect the full intended change against its base, not only the last commit. Read relevant code, tests, documentation, linked requirements, and decisions. Commit messages and the existing PR body are clues, not substitutes for the current diff. When updating a description, read the existing text first and identify what has actually changed.

Establish what changes, why it is needed, affected behavior and consumers, and meaningful decisions or preserved guarantees. Verify consequential claims against the available sources, then select those needed to understand the purpose, specific behavior, rationale, impact, compatibility, or requested verification. Factual presence in the diff is not sufficient reason to include something. Separate implemented behavior, proposed work, observed results, and expected outcomes. Do not invent measurements, commands, issue references, screenshots, alternatives, or completed checks.

Describe the branch's resulting state rather than narrating its revisions. Retain relevant rationale from prior discussion without turning the description into a response history. Link related work where useful; use closing keywords only when the PR actually resolves the linked issue under the project's conventions.

## Answer the questions actually asked

Read [writing-guide.md](references/writing-guide.md) when selecting content, interpreting testing prompts, or deciding how much explanation is needed.

Use each template question and its instructions to determine the kind of answer it needs. A purpose question needs the problem and change; an impact question needs consequences. Testing instructions, checks performed, and coverage added are distinct answers. Do not put the same generic summary under different headings or replace a requested verification method with a passing result.

When a field asks only for verification instructions, give the method and expected observations, not a historical run result alongside them. Use results in a field that requests them or where they substantiate a relevant claim. Do not transfer every available fact into the body simply because it was supplied.

Check a box only when its statement is supported. An inapplicable condition and an unknown answer are different. Follow the template's convention for inapplicable fields; obtain essential missing facts or leave completion unclaimed rather than guessing. Keep necessary author-facing questions outside the body.

If there is no template, choose the smallest structure that explains the purpose and change, with any additional information reviewers need. Do not add empty sections just to resemble other PRs.

## Preserve useful detail; remove defensive filler

Scale explanation to the change, not a word count. A small correction may need a paragraph; a contract change may need before/after usage, compatibility, and migration guidance. Preserve conditions, technical mechanisms, tradeoffs, or unchanged behavior that affect review. Include examples, measurements, visual evidence, or a reading order when they reduce reconstruction work. Removing irrelevant material must not reduce substantive changes to a vague one-line summary.

State supported claims directly. Do not invent a broader claim merely to deny it, or append qualifications against interpretations the description has not invited. Include a limitation when it changes the meaning of an actual claim or a review decision. Routine good-practice, compliance, and process announcements are not distinctive change content, even when newly added to a policy or instruction file. For a genuine policy or contract change, explain the concrete changed requirement and its effect on affected work or consumers, not declarations of adherence. Remove repetition and process narration without cutting substantive explanations.

Source bookkeeping is not automatically reviewer-facing content. Omit routine notices that no execution record, measurement, attachment, or linked issue was supplied unless a project question requires that answer or the absence changes a concrete review decision. Clearing an unsupported completion claim does not require adding a status footer.

Provide enough verification detail for the intended reader. An environment sentence and command can be sufficient for a simple check; an order-dependent manual workflow may need steps. Do not force either format onto every change. Use known commands and observable expected results, not fabricated setup instructions. Use existing execution evidence when asked what was run; a writing request alone does not authorize running checks.

## Review and deliver the requested artifact

Apply [review-checklist.md](references/review-checklist.md) before returning the result. For a focused revision, preserve unaffected content and change only the requested part and dependent wording. For a refresh, align the description with the current whole change rather than appending a revision log.

Return a usable title and body for a draft or rewrite. For a review, give concrete findings tied to the source and the smallest useful corrections; do not replace a requested review with an unsolicited full rewrite. Respect a requested file or response format.

Drafting does not authorize code changes, test execution, branching, commits, pushes, PR creation or updates, or comments. Handle explicitly requested operations separately. A written draft is not permission to create a remote PR in draft state.

Exclude secrets and unnecessary identifying or confidential information from public-facing text. Use conversations and private material only for the requested work; do not reuse them as examples, evaluation fixtures, or documentation without explicit permission. Construct reusable scenarios independently rather than disguising recognizable accounts with different names.
