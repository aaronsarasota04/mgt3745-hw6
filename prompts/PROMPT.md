# PROMPT.md

The exact text both builders received, unchanged between them.

---

Build a single-page web app that implements F1, the skill-gap feature below, in the supplied project. Inspect and follow the project's existing structure and API contract. Use only supplied postings and their collection date; do not invent data, dates, API endpoints, or credentials. If the project does not include the required API or posting data, make that limitation clear in the interface rather than showing fabricated results. Implement F1 only; do not add ranking, role suggestions, accounts, or outreach tracking.

## F1. Skill Gap for a Target Role (J-Devon)

- F1-1. THE SYSTEM SHALL let a student enter the skills they already have and choose one target role from the roles in the posting set. (PROBE-001 #3)
- F1-2. WHEN a student submits skills and a target role, THE SYSTEM SHALL list the skills that appear in postings for that role and are missing from the student's list.
- F1-3. THE SYSTEM SHALL match skills without regard to capitalization or extra spaces.
- F1-4. THE SYSTEM SHALL show the date the posting set was collected next to every result, so a student does not read a frozen snapshot as current.
- F1-5. IF the student enters no skills, THEN THE SYSTEM SHALL ask for at least one skill and SHALL NOT show a result.
- F1-6. IF the target role has no postings in the data set, THEN THE SYSTEM SHALL say so, naming the role, and SHALL NOT show a gap.
- F1-7. IF the student already has every skill in the postings for the role, THEN THE SYSTEM SHALL say no gap was found instead of showing an empty list.
- F1-8. THE SYSTEM SHALL read postings only through the team's own API, and SHALL NOT hold a database key in browser code. (PROBE-001 #1)
- F1-9. IF a request from the browser tries to add, change, or delete a posting, THEN THE SYSTEM SHALL refuse it. (PROBE-001 #4)
- F1-10. THE SYSTEM SHALL show only postings and a collection date that the team supplied, and SHALL NOT generate either. (PROBE-001 #2)

## Relevant User Context

A graduating senior is applying for entry-level tech roles. They want to understand their fit even when he does not meet every listed requirement, because a job description describes the employer's preferred candidate rather than a strict checklist. Success means they can assess their fit with confidence.

## Relevant Style Requirements

- Use navy `#1F3A5F` for primary elements, yellow `#FFD700` for accents with navy text, white `#FFFFFF` for the background, and near-black `#1A1A1A` for body text.
- Use Arial for body text and Times New Roman for headings. Minimum text size is 12px.
- Use an 8px spacing unit and 4px corner radius.
- Keep text contrast at or above WCAG 4.5:1 for small text. Do not use yellow text on white.
- Keep validation feedback close to the field it describes.
- Keep the interface focused on entering skills, choosing a role, and viewing the resulting gap.

## Scope Constraints

- Use plain HTML, CSS, and JavaScript; no frontend framework or build step.
- Keep structure, styles, and behavior in separate files.
- Do not add live posting data, student accounts, saved records, employer contact, or application submission.
- Do not put database keys, credentials, or secrets in browser code.

## Retries

None