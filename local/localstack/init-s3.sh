#!/bin/bash
set -e

BUCKET=${S3_BUCKET:-passit-bucket}
REGION=${DEFAULT_REGION:-ap-northeast-2}

echo "LocalStack S3 초기화: $BUCKET 버킷 생성 중..."

awslocal s3 mb "s3://$BUCKET" --region "$REGION"

awslocal s3api put-bucket-cors --bucket "$BUCKET" --cors-configuration '{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }]
}'

echo "S3 버킷 준비 완료: s3://$BUCKET"
