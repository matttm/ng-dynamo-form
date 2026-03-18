#!/usr/bin/env bash

set -euo pipefail

TABLE_NAME="form-configurations"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SEED_ITEM_PATHS=(
  "${SCRIPT_DIR}/generic-configurable-form-2025.item.json"
  "${SCRIPT_DIR}/generic-configurable-form-2026.item.json"
)

if awslocal dynamodb describe-table --table-name "${TABLE_NAME}" >/dev/null 2>&1; then
  echo "DynamoDB table ${TABLE_NAME} already exists."
else
  awslocal dynamodb create-table \
    --table-name "${TABLE_NAME}" \
    --attribute-definitions \
      AttributeName=formId,AttributeType=S \
      AttributeName=year,AttributeType=N \
    --key-schema \
      AttributeName=formId,KeyType=HASH \
      AttributeName=year,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST

  echo "Created DynamoDB table ${TABLE_NAME}."
fi

for seed_item_path in "${SEED_ITEM_PATHS[@]}"; do
  awslocal dynamodb put-item \
    --table-name "${TABLE_NAME}" \
    --item "file://${seed_item_path}"
done

echo "Seeded demo form configuration items."
