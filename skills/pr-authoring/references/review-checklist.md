# Review the description before returning it

Check the artifact against the actual request, project instructions, and current change. These questions are not mandatory PR headings.

## Project questions and format

- Does each answer address its question and explanatory instructions?
- Are required headings, conditional fields, checklists, and functional markers handled according to the project template?
- Are instructional comments distinguished from content that must remain?
- Is the title specific and consistent with project conventions, without an invented style rule?

## Purpose and factual accuracy

- Can a reviewer understand what changes and why without reconstructing the conversation?
- Does the description match the whole intended diff rather than one commit, an obsolete plan, or previous review exchanges?
- Are behavior, implementation, coverage added, and executed checks distinguished?
- Are issue references, commands, measurements, screenshots, and completion claims supported?
- Are any checkboxes ticked without evidence or unknown answers presented as inapplicable?

## Useful depth

- Are the purpose, specific behavior, rationale, conditions, consequences, decisions, and preserved guarantees needed for review present, rather than replaced by a vague summary?
- Are compatibility, migration, or operational implications explained where they matter? For a policy or instruction change, are the concrete changed requirement and its effect clear rather than merely asserting adherence?
- Do examples or review pointers make the change easier to assess rather than repeat the prose?
- Has shortening removed useful technical information, or has a simple change acquired unnecessary ceremony?

## Testing semantics

- If the question asks how to verify, can the reader identify the necessary actions and expected observations?
- If it asks what ran, does the answer accurately state the recorded execution and result?
- If it asks about coverage, does it explain meaningful behavior rather than imply a passing run?
- Are steps included only when the workflow needs them, with meaningful order preserved?

## Reader value and tone

- Does each detail serve the reader's understanding or a requested answer, rather than qualify for inclusion only because it is true or present in the diff?
- Does each qualification affect an actual claim or review decision, without inventing an exaggerated interpretation merely to refute it?
- Can routine good-practice, compliance, and process announcements be removed, including ones newly written in policy files, while preserving substantive explanations and relevant constraints?
- For a focused edit, is unaffected content preserved rather than replaced with a summary?

## Artifact and action boundaries

- Is the response a draft, requested revision, or concrete review, rather than a different artifact?
- Are necessary author-facing questions outside the body?
- Are secrets and unnecessary confidential details excluded?
- Has private source material been kept out of reusable examples and evaluations unless explicitly authorized?
- Has writing remained separate from code changes, check execution, and remote operations that were not requested?
