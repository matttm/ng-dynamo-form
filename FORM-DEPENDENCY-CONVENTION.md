# Form Dependency Convention

The form schema uses a `dependencies` array on each question to express rules that react to other values in the form, to context values, or to backend-derived values.

## Shape

```json
{
  "dependencies": [
    {
      "effect": "hidden",
      "when": "all",
      "conditions": [
        {
          "source": "answer",
          "field": "previousParticipation",
          "operator": "equals",
          "value": "Yes"
        }
      ]
    }
  ]
}
```

## Convention

- `effect` tells the renderer what should happen when the rule matches.
- `when` controls whether all conditions must match or just any one of them.
- `conditions` contains the values to inspect.

## Supported effects

| Effect | Meaning |
| --- | --- |
| `visible` | Show the question only when the rule matches. |
| `hidden` | Hide the question when the rule matches. |
| `enabled` | Enable the question only when the rule matches. |
| `required` | Make the question required only when the rule matches. |

## Supported condition sources

| Source | Meaning |
| --- | --- |
| `answer` | Read another form control's value. |
| `context` | Read a schema context value such as `applicationYear`. |
| `backend` | Reserved for backend-derived values. |

## Supported operators

| Operator | Meaning |
| --- | --- |
| `equals` | Exact match |
| `notEquals` | Inverse exact match |
| `greaterThan` | Numeric comparison |
| `greaterThanOrEqual` | Numeric comparison |
| `lessThan` | Numeric comparison |
| `lessThanOrEqual` | Numeric comparison |
| `includes` | Array contains a value or values |
| `exists` | Value is present and non-empty |

## Recommended usage

- Use `visible` when a question should only appear for a narrow case.
- Use `hidden` when a question is normally available but should disappear for a specific answer state.
- Use `required` alongside `visible` when a conditionally displayed field must be completed once shown.
- Prefer referencing `field` values by `formControlName` so the dependency matches the actual control in the form.

## Example from this repo

The 2026 supplemental step hides `portfolioUrl` when `previousParticipation === "Yes"`.
That means returning applicants do not see the portfolio field, while new applicants still do.
