#!/usr/bin/env bash

set -euo pipefail

TABLE_NAME="form-configurations"

if awslocal dynamodb describe-table --table-name "${TABLE_NAME}" >/dev/null 2>&1; then
  echo "DynamoDB table ${TABLE_NAME} already exists."
else
  awslocal dynamodb create-table \
    --table-name "${TABLE_NAME}" \
    --attribute-definitions \
      AttributeName=formId,AttributeType=S \
      AttributeName=version,AttributeType=N \
    --key-schema \
      AttributeName=formId,KeyType=HASH \
      AttributeName=version,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST

  echo "Created DynamoDB table ${TABLE_NAME}."
fi

awslocal dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "formId": { "S": "customer-intake-demo" },
    "version": { "N": "1" },
    "status": { "S": "draft" },
    "title": { "S": "Customer Intake Demo" },
    "schemaVersion": { "S": "2026-03-18" }
  }'

echo "Seeded demo form configuration item."

