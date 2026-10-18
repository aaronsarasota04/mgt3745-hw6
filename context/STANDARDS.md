# STANDARDS.md

Status: ACTIVE in Module 3.

Merged from team members' HW5 versions (Aaron, Canon, Nuhamin, Prince, and Ryan). Where two rules conflicted, the stricter version was retained.

This file is normative if an adapter or context/CLAUDE.md conflicts. Repair inconsistent copies; do not silently choose different policies for humans and agents.

## Documents

1. **Rule Ownership & Persistence:** `STANDARDS.md` is normative. Rules that apply universally across all tasks belong in `CLAUDE.md`. Feature-specific, layout-specific, or single-use rules (such as visual interface hierarchies, temporary planning restrictions, or commit message formatting) belong in task prompts rather than persistent context.
2. **Traceability:** When a rule is moved to a task prompt for execution, its general principle remains recorded in `STANDARDS.md` for traceability.

## Code

1. **Naming Conventions:** Use descriptive camelCase identifiers for JavaScript variables and functions, kebab-case for file names and CSS classes, and PascalCase for constructors/classes. Short conventional names for events and indexes are acceptable when their role is obvious. Name booleans as questions (e.g., `isOverdue`). Avoid arbitrary minimum name lengths or encoding type names into identifiers (e.g., use `contactEntries`, not `contactArray`).
2. **Separation of Concerns:** Keep structure, presentation, and behavior strictly separated into `index.html`, `styles.css`, and `app.js` (with server code isolated in `worker.js`). No inline `style` attributes, application styles, or inline script content in the HTML beyond the single tag loading `app.js`. Use lexical scope and IIFE wrappers to prevent accidental global variables.
3. **Modular Function Design:** Give each JavaScript function a single, distinct purpose and keep functions loosely coupled to support future extension without affecting existing behavior.
4. **Commenting & Code Cleanliness:** Inline comments explain *why* non-obvious choices, rules, or workarounds exist—never *what* a line of code does. Do not narrate every statement. Delete temporary debug output (e.g., stray `console.log` statements) prior to submission.
5. **DOM Manipulation & XSS Prevention:** Use `textContent` for all user-supplied or user-controlled text rendering. Never insert user strings through `innerHTML`.
6. **SQL Injection Prevention:** User values reach SQL through `bind()` parameter bindings (e.g., `prepare("... VALUES (?)").bind(value)`). Never use string concatenation for SQL statements.
7. **Accessibility & Form Handling:** Associate form controls explicitly with labels and make success and error states perceivable (e.g., using `role="alert"` and `aria-live`). Preserve unsaved user input in form fields when a storage write or network save fails.
8. **Error Handling & Reporting:** A failed request or network call must produce a clear, human-readable error message shown to the user on the page. Failed requests must be handled gracefully through unified helpers and never thrown as uncaught errors in the console.
9. **Credential & Secret Security:** No credentials, keys, tokens, or passwords in code, comments, configuration files, context files, or repositories. Database IDs are treated as addresses and may appear in `wrangler.toml`. Secret management must comply with `TOOLS.md`.
10. **Dependencies & Trust Boundaries:** No external frameworks, libraries, CDN tags, or build steps allowed unless explicitly documented with a row in `TOOLS.md` defining its trust boundary prior to installation.
11. **Data Authenticity & Integrity:** Present submitted items strictly as entered by the user. Do not fabricate urgency, deadlines, automatic recommendations, or status changes (e.g., implying an item was seen or acknowledged) unless explicitly recorded in data.

## Git

1. **Commit Message Format:** Write commit messages in the imperative mood with a subject line under 60 characters that names the changed behavior and its purpose (e.g., `"Add timestamp to submitted updates"`). Include a body line when necessary to explain rationale not obvious from the diff. Avoid vague messages like `"updated stuff"` or `"final."`

---

## Conflict Notes & Merging Choices

* **Separation of Concerns (Code #2):** Combined the browser/server boundary from Ryan and Nuhamin (`index.html`, `styles.css`, `app.js`, `worker.js`) with Canon and Prince's strict prohibition against inline styles and scripts. Choice: Kept the strictest version requiring explicit IIFE wrappers, lexical scoping, and complete elimination of inline scripts/styles.
* **Naming Conventions (Code #1):** Reconciled the naming rules across team members: camelCase for variables/functions, kebab-case for file names and CSS classes, and PascalCase for constructors/classes. Choice: Incorporated Ryan's stricter requirements banning type-encoding names (e.g., `contactEntries` over `contactArray`) and requiring question formats for booleans (`isOverdue`).
* **Comments & Cleanliness (Code #4):** Resolved variation between Aaron's rule ("explain purpose of sections") and Canon/Prince/Ryan/Nuhamin's rules ("explain why, never what"). Choice: Adopted the stricter rule that inline comments must strictly explain non-obvious *why* decisions rather than narrating what code does, while preserving the mandatory removal of all temporary debug output (such as `console.log`) before submission.
* **XSS & SQL Security (Code #5 & #6):** Preserved zero-tolerance constraints across all members' versions: strict usage of `textContent` over `innerHTML` for any user text and mandatory SQL parameter binding via `.bind()` (prohibiting string concatenation).
* **Form State Preservation (Code #7):** Aaron, Canon, Prince, and Ryan addressed preserving unsaved input during storage/write failures. Choice: Kept the broader standard requiring unsaved form input to survive any save or network failure so user input is never silently discarded.