---
name: issue-authoring
description: Draft, revise, or review GitHub and Jira issues for bugs, features, improvements, and scoped work. Use when preparing an issue before filing, turning project discussion into actionable issue text, or improving an existing title and body. Follow project templates, preserve useful context and constraints, and keep content preparation separate from publication.
---

# Issue authoring

Write for a contributor who has not read the conversation. An issue identifies a problem or work to be done, explains why it matters, and provides enough context to act. It need not contain a completed diagnosis or implementation.

## Establish the request and protect source material

Identify the requested artifact: a new draft, a focused revision, or review findings. Determine the project, issue type, audience, language, and output format from the request and available material. Ask only for consequential information that cannot be obtained from those sources.

Use conversations and private project material only for the requested work. Do not repurpose them as reusable examples, evaluation fixtures, documentation, or training material without explicit permission. Changing names or links is not sufficient to make a recognizable account suitable for reuse. Create independent synthetic material when reusable examples are needed.

Exclude credentials and unnecessary personal or confidential information from public-facing drafts. Preserve useful diagnostic structure with safe substitutions; do not silently change facts that affect the claim. Raise a consequential disclosure question outside the draft when it cannot be resolved safely.

Preparing content does not authorize publishing an issue, modifying a remote issue, or posting a comment. Return the requested artifact. Handle an explicitly authorized publication request as a separate workflow with a known target; this skill supplies no publication procedure. Do not change application code or unrelated documentation while drafting.

## Read the relevant project context

Use the target project's current issue template and contribution guidance when available. Read supplied sources and relevant discussions, including their dates and whether proposals were accepted. Distinguish current scope from superseded requests and unresolved suggestions. Do not assume either the original body or the newest comment automatically represents the agreed work.

Consult code, tests, documentation, and artifacts when they can resolve a material ambiguity. Research should clarify the issue, not impose a requirement to finish the investigation or implementation first. Do not claim to have read inaccessible sources or replace missing evidence with guesses.

Keep reported observations, independently observed results, explanations supported by source, and proposed changes distinct. Attach references where they support a claim or help investigation. Describe the behavior rather than narrating the author's research process. A useful report may have an unknown cause; a hypothesis should not be stated as an established explanation.

## Choose the issue's content and shape

Read [templates.md](references/templates.md) to choose an appropriate starting structure when the project does not provide one. Adapt the questions to the work rather than forcing every issue into the same headings. The target project's template takes precedence.

Select content that answers the reader's practical questions:

- What problem, limitation, or missing work needs attention?
- Who or what is affected, and why does it matter?
- Which known conditions, inputs, examples, reproduction details, or environments help establish the problem?
- What behavior or capability is needed instead?
- Which technical details, compatibility guarantees, accessibility requirements, or operational constraints must a solution preserve?
- Where useful, what approach is proposed, what decisions remain open, and what is outside the work?
- Which observable outcomes would establish completion?

Preserve details that affect understanding or implementation choices. Clearer prose is not a reason to remove useful substance. Scale the structure to the work: a small problem may need a few paragraphs, while a broader improvement may need rationale, constraints, a proposal, and verification.

Keep the work type intact. A feature request explains the capability and motivation; an improvement explains the limitation and relevant tradeoffs. A coverage task describes scenarios and outcomes to prove without implying that supported behavior is broken. Do not expand a testing task into product changes or omit requested coverage merely because the current implementation works.

State only supported facts. Do not invent versions, frequencies, reproduction steps, root causes, commands, measurements, or project decisions. Derive proposed completion checks from the stated outcome, not unrelated preferences. Include evidence limitations when they change interpretation; do not add routine investigation-status disclaimers or lists of unspecified metadata. Required template fields still need an honest answer.

Source notes are not a checklist of statements to repeat. An unavailable attachment or incomplete diagnosis usually requires no sentence in the issue: omit an optional section that contains only unavailable information. Likewise, remove unnecessary sensitive material without appending a narrative about the redaction or upload permission. Keep disclosure questions outside the draft. Include such context only when it changes the technical claim or answers a required project field.

## Draft and review

Choose a specific title naming the affected behavior or requested capability. Follow the project's format without imposing universal title prefixes, character limits, section counts, or manual line wrapping.

Answer template questions according to their meaning. Instructions for testing describe what to do and observe; historical results do not replace them. Include actual results when they help establish the problem, and do not claim that planned checks have run.

Use headings, lists, code, commands, and links to aid reading. Avoid empty optional sections, duplicated work lists, research dumps, and progress-report footers. Explain a proposed solution's relationship to the problem without presenting an open choice as a settled decision.

For focused revisions, preserve unaffected content and all relevant constraints. Change only the requested part and dependent wording. Before returning the result, apply [review-checklist.md](references/review-checklist.md), comparing revisions with the original to catch information loss.

Return a usable title and body for a draft or rewrite. For a review, identify concrete problems and the smallest useful corrections; do not substitute an unsolicited full rewrite. Keep necessary clarification questions and author-facing notes outside the issue body. Follow any requested file or response format, and do not imply that publication occurred.
