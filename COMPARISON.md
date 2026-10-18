# COMPARISON.md

## Row-by-Row Evidence

Pass, Partial, or Fail, each with one line of evidence (a screenshot, a file and line, or a test result).

| EARS row | bolt.new | Evidence | AI Studio | Evidence |
|---|---|---|---|---|
| <ID> | <Pass / Partial / Fail> | <evidence> | <Pass / Partial / Fail> | <evidence> |

## Scope Creep

| | bolt.new | AI Studio |
|---|---|---|
| Files created or changed that the feature did not need | <count> | <count> |
| Additions the spec excludes (list them) | <items> | <items> |

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
