# FEATURES.md

## Kano Classification

| ID | Feature | Class | Evidence and reasoning |
|---|---|---|---|
| F1 | Show the skills a student is missing for a target role | Must-be | Without it the tool answers nothing. J-Devon. Aaron's recruiter said students rule themselves out by reading a job description as a checklist, and the gap view is the check they lack. |
| F2 | Rank missing skills by how many postings list them | Performance | A better ranking is worth more, and it gives the one gap worth closing first. J-Devon. No interview tested a ranking. |
| F3 | Show how many of the top-ranked skills the student already has | Performance | Helps the decision to apply. Aaron's recruiter said a description describes the employer's preferred candidate, not a strict checklist. We assume a count helps, and no interview tested it. |
| F4 | List source types beyond the major job boards | Performance | J-Devon, second job statement. Aaron's recruiter said not all jobs are posted on LinkedIn and alumni one to three years ahead can help a lot. More role-specific sources are more useful. |
| F5 | Surface deadlines for a student who checks once a day | Attractive | J-Maya. Prince's chapter research found the one-window habit in a commuting member. Nobody tested it with job boards. It needs live postings, so it is out of Phase 2. |
| F6 | Track outreach and follow-up | Attractive | J-Jordan. Ryan's athletic research found students lose track of whom to follow up with. Nobody tested it with job search. It needs a saved student record, so it is out of Phase 2. |

Claude drafted this table. Prince checked each classification against the research (a C row in TEAM.md). Only Aaron's interviews were about this problem, so F5 and F6 rest on patterns from other research and say so.

## EARS Acceptance Criteria

### F1. Skill Gap for a Target Role (J-Devon)

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

### F2. Ranked Gaps (J-Devon)

- F2-1. THE SYSTEM SHALL order the missing skills by the number of postings for the role that list each one, highest first.
- F2-2. THE SYSTEM SHALL show the posting count beside each skill and the total postings for the role.
- F2-3. WHEN results are shown, THE SYSTEM SHALL mark the top-ranked missing skill as the first gap to close.
- F2-4. IF two skills have the same count, THEN THE SYSTEM SHALL order them alphabetically, so the order does not change between page loads.
- F2-5. IF the role has fewer than 10 postings, THEN THE SYSTEM SHALL say the sample is small next to the ranking.

### F3. Share of Top Skills Held (J-Devon)

- F3-1. THE SYSTEM SHALL show how many of the 10 top-ranked skills for the role the student already has.
- F3-2. IF the student has fewer than half of the top-ranked skills, THEN THE SYSTEM SHALL still show the gap and SHALL NOT tell the student whether to apply, because the decision stays with the student.
- F3-3. IF the role has fewer than 10 ranked skills, THEN THE SYSTEM SHALL count against the skills it has and show the total used.

### F4. Where Else to Look (J-Devon)

- F4-1. THE SYSTEM SHALL show a short list of source types to search beyond the major job boards: company career pages, university career services, alumni one to three years ahead, and smaller companies.
- F4-2. THE SYSTEM SHALL describe each source type in one line and SHALL NOT name or link a specific person.
- F4-3. IF the sources list fails to load, THEN THE SYSTEM SHALL still show the gap result and say the sources list is unavailable.

## Exclusions

These are decisions, recorded so nobody builds them by accident.

- **X1. No live posting data (F5).** The system reads a hand-collected posting set loaded once. Deadline alerts need live data.
- **X2. No student accounts and no saved records (F6).** ADR-001 has no login. Outreach tracking needs a saved record.
- **X3. No contact with employers, recruiters, or alumni.** The system never sends a message to anyone.
- **X4. No applications through the system.** It shows evidence and the student decides.
- **X5. No third-party backend or hosted database in Phase 2.** Data lives where ADR-001 puts it. (PROBE-001 #1)
- **X6. No front-end framework and no build step.** The page is plain HTML, CSS, and JavaScript, as STANDARDS.md requires. (PROBE-001 #5)