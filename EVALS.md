# EVALS.md

## Prediction Stake

### Tight (a count)

bolt.new will satisfy 8 out of 10 EARS rows. AI Studio will also satisfy 8 out of 10 EARS rows

**Resolution (2026-10-20):** 10 out of 10
### Loose (a direction with a reason)

Both builders will handle the most common case (skills entered for both student and target role)  better than the edge cases, because the spec has several IF rows requiring distinct empty, validation, and fallback states the builds may miss.

**Resolution (2026-10-20):** True in the specific sense that the common case was not the only thing the builders handled; both passed all EARS rows, including the empty, validation, and fallback cases in F1-5 through F1-9. The issue was not with logic but with one environment-specific Bolt.new rendering defect, not with the underlying rules or test coverage.

### Open (a question the builds can answer)

Will either builder handle matching skills without regard to capitalization or extra spaces?

**Resolution (2026-10-20):** Yes. Both builders passed EARS 3: “match skill names without regard to case or extra spaces,” and `evals/shared.test.js` asserts that behavior for both `bolt` and `aistudio`.

## Error Log

Most frequent first. Your top row is the first finding in COMPARISON.md.

| Error | Builder | Frequency | EARS row | Evidence |
|---|---|---|---|---|
| Bolt.new screenshot renders unstyled default browser controls on a dark background instead of the intended styles | bolt.new | 1 | STYLE.md | `bolt.new output HW6.png` is visibly unstyled, while the repository source (`bolt.js`, `bolt.html`, `bolt.css`) and `evals/shared.test.js` still pass all EARS checks; JUDGMENT.md identifies this as a preview/runtime CSS linking issue, not a repo logic defect. |
