# COMPARISON.md

## Row-by-Row Evidence

Pass, Partial, or Fail, each with one line of evidence (a screenshot, a file and line, or a test result).

| EARS row | bolt.new | Evidence | AI Studio | Evidence |
|---|---|---|---|---|
| 1 | Pass | `npm test`: `bolt: EARS 1: choose one target role from roles in the postings` passed (`evals/shared.test.js`). | Pass | `npm test`: `aistudio: EARS 1: choose one target role from roles in the postings` passed (`evals/shared.test.js`). |
| 2 | Pass | `npm test`: `bolt: EARS 2: show posting skills for the selected role that the student lacks` passed (`evals/shared.test.js`). | Pass | `npm test`: `aistudio: EARS 2: show posting skills for the selected role that the student lacks` passed (`evals/shared.test.js`). |
| 3 | Pass | `npm test`: `bolt: EARS 3: match skill names without regard to case or extra spaces` passed (`evals/shared.test.js`). | Pass | `npm test`: `aistudio: EARS 3: match skill names without regard to case or extra spaces` passed (`evals/shared.test.js`). |
| 4 | Pass | `npm test`: `bolt: EARS 4: show the posting-set collection date with each result` passed (`evals/shared.test.js`). | Pass | `npm test`: `aistudio: EARS 4: show the posting-set collection date with each result` passed (`evals/shared.test.js`). |
| 5 | Pass | `npm test`: `bolt: EARS 5: require at least one skill and show no result when none are entered` passed (`evals/shared.test.js`). | Pass | `npm test`: `aistudio: EARS 5: require at least one skill and show no result when none are entered` passed (`evals/shared.test.js`). |
| 6 | Pass | `npm test`: `bolt: EARS 6: name a role with no postings and do not show a gap` passed (`evals/shared.test.js`). | Pass | `npm test`: `aistudio: EARS 6: name a role with no postings and do not show a gap` passed (`evals/shared.test.js`). |
| 7 | Pass | `npm test`: `bolt: EARS 7: say no gap was found instead of showing an empty list` passed (`evals/shared.test.js`). | Pass | `npm test`: `aistudio: EARS 7: say no gap was found instead of showing an empty list` passed (`evals/shared.test.js`). |
| 8 | Pass | `npm test`: `bolt: EARS 8: read postings through the team's API without a browser database key` passed (`evals/shared.test.js`). | Pass | `npm test`: `aistudio: EARS 8: read postings through the team's API without a browser database key` passed (`evals/shared.test.js`). |
| 9 | Pass | `npm test`: `bolt: EARS 9: refuse browser requests that attempt to mutate postings` passed (`evals/shared.test.js`). | Pass | `npm test`: `aistudio: EARS 9: refuse browser requests that attempt to mutate postings` passed (`evals/shared.test.js`). |
| 10 | Pass | `npm test`: `bolt: EARS 10: display only supplied posting skills and collection date` passed (`evals/shared.test.js`). | Pass | `npm test`: `aistudio: EARS 10: display only supplied posting skills and collection date` passed (`evals/shared.test.js`). |

## Scope Creep

| | bolt.new | AI Studio |
|---|---|---|
| Files created or changed that the feature did not need | 0 | 2 |
| Additions the spec excludes (list them) | None | Quick-add common entry-level skills, a Clear Inputs button, a System & Security Integrity Standards panel, and posting dataset status. **Total : 4** |

## Judgment Eval

Agreement rate with the second grader: 5 of 5 items, 100%>. Details in [JUDGMENT.md](JUDGMENT.md).

## Findings

The top error-log row is Bolt.new's visual rendering failure: although `bolt.css` defines the required colors, the app screenshot showed unstyled default browser components on a dark background. The repository's EARS tests passed, so this points to a CSS asset-linking or preview/runtime issue rather than a requirements-logic failure. For this build, Bolt.new was not reliable for front-end delivery; it may still be useful for back-end work, but that should be evaluated separately.

## Spec Gaps

Every place where both builders guessed, or guessed differently.

| Gap | What each builder assumed | EARS change or exclusion that closes it |
|---|---|---|
| Posting dataset status | AI Studio added a header status that shows loading, the snapshot's collection date, or a load failure. | Add F1-11: show loading while the dataset loads, its supplied collection date on success, and an unavailable status on failure. |
| Quick-add common skills | AI Studio added preset skill chips that append to the student's input and avoid adding a skill already present. | Add F1-12: provide common entry-level skills as addable presets without replacing existing input or duplicating an existing skill. |
| Clear inputs | AI Studio added a control that resets the selected role, entered skills, validation feedback, and displayed results. | Add F1-13: when the student chooses Clear Inputs, clear those inputs and UI states. |
| System and security integrity panel | AI Studio added a visible standards panel and a mutation-refusal test control, although the EARS specify security behavior rather than an explanatory panel or in-app test. | Exclude the panel and test control. Existing F1-8, F1-9, and F1-10 remain the requirements for system and data integrity. |

## Recommendation

### Criteria and Weights (commit before scoring)

| Criterion | Weight (1 to 5) | Why |
|---|---|---|
| Cost | 3 | Free tiers exist for both AI Studio and bolt.new |
| Webpage design  | 3 | To ensure more users will like the UI. |
| Maintainability  | 4 | To ensure the team will be able to build on top of this |
| Time needed to manually fix AI output to match spec(larger score means less time) | 4 |

### Scores (commit after the weights)

| Criterion | Weight | bolt.new | AI Studio |
|---|---|---|---|
| Cost | 3 | 3 | 3 |
| Webpage design | 3 | 1 | 4 |
| Maintainability | 4 | 3 | 4 |
| Time needed to manually fix AI output to match spec | 4 | 2 | 4 |
| **Weighted total (out of 100)** | | **45.7** | **75.7** |

### Decision

Choose AI Studio for Phase 2. It scored higher overall (75.7/100 versus Bolt.new’s 45.7), particularly for webpage design and the time needed to manually correct the output. Use it as a starting point for the front end, then integrate the result with ADR-001’s chosen stack: a static HTML/CSS/JavaScript page served with the Cloudflare Worker and D1 database. One tradeoff is scope control: AI Studio added features the requirements did not ask for, so the team will need to remove or adjust those additions to keep the implementation within scope. Its generated output still needs review to ensure it fits the team’s architecture.

## Handoff to the Team

Pull request or issue proposing a FEATURES.md change: <URL>
