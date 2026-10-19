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

Agreement rate with the second grader: <N of M items, %>. Details in [JUDGMENT.md](JUDGMENT.md).

## Findings

<Start with your top error-log row. What happened, which builder, and what it tells you.>

## Spec Gaps

Every place where both builders guessed, or guessed differently.

| Gap | What each builder assumed | EARS change or exclusion that closes it |
|---|---|---|
| <gap> | <assumptions> | <proposed row> |

## Recommendation

### Criteria and Weights (commit before scoring)

| Criterion | Weight (1 to 5) | Why |
|---|---|---|
| <criterion> | <weight> | <reason> |

### Scores (commit after the weights)

| Criterion | Weight | bolt.new | AI Studio |
|---|---|---|---|
| <criterion> | <weight> | <1 to 5> | <1 to 5> |
| **Weighted total** | | <total> | <total> |

### Decision

<Which builder your team should use for this feature in Phase 2, why, and at least one thing that gets harder with that choice. Tie the reasoning to your team's ADR-001 stack.>

## Handoff to the Team

Pull request or issue proposing a FEATURES.md change: <URL>
