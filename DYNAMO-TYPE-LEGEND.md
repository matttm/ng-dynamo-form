# DynamoDB Type Legend

The seed files in `docker/localstack/init/*.item.json` use DynamoDB's typed JSON format.
Each value is wrapped in an object whose key tells DynamoDB what type the value is.

Example:

```json
{
  "name": { "S": "Program Application" },
  "year": { "N": "2025" },
  "activeYears": { "L": [{ "N": "2025" }, { "N": "2026" }] },
  "config": {
    "M": {
      "formId": { "S": "generic-configurable-form" }
    }
  }
}
```

## Common type markers

| Marker | Meaning | Example |
| --- | --- | --- |
| `S` | String | `{ "S": "hello" }` |
| `N` | Number | `{ "N": "2026" }` |
| `BOOL` | Boolean | `{ "BOOL": true }` |
| `NULL` | Null | `{ "NULL": true }` |
| `M` | Map / object | `{ "M": { "key": { "S": "value" } } }` |
| `L` | List / array | `{ "L": [{ "S": "a" }, { "S": "b" }] }` |

## Less common markers

| Marker | Meaning | Example |
| --- | --- | --- |
| `SS` | String set | `{ "SS": ["a", "b"] }` |
| `NS` | Number set | `{ "NS": ["1", "2"] }` |
| `BS` | Binary set | binary values as a set |
| `B` | Binary value | binary value |

## How to read nested values

- `M` means "this is an object with named properties".
- `L` means "this is an array of typed values".
- The inner value still needs its own Dynamo type marker.

Example:

```json
{
  "steps": {
    "L": [
      {
        "M": {
          "id": { "S": "application-questions" },
          "applicableYears": { "L": [{ "N": "2025" }] }
        }
      }
    ]
  }
}
```

That example means:

- `steps` is a list
- each item in the list is an object
- `id` is a string
- `applicableYears` is a list of numbers

## Why this exists

LocalStack is loading these files through DynamoDB APIs, not as plain application JSON.
Because of that, the files need DynamoDB's explicit type wrappers instead of normal JSON values.
