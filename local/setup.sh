#!/bin/bash
set -e

ENV_FILE="$(dirname "$0")/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: .env 파일이 없습니다."
  echo "  cp .env.example .env 후 GITHUB_TOKEN, GITHUB_ACTOR를 채워주세요."
  exit 1
fi

# shellcheck source=.env
source "$ENV_FILE"

if [ -z "$GITHUB_TOKEN" ] || [ -z "$GITHUB_ACTOR" ]; then
  echo "ERROR: .env에 GITHUB_TOKEN과 GITHUB_ACTOR가 필요합니다."
  echo ""
  echo "GitHub PAT 발급 방법:"
  echo "  1. https://github.com/settings/tokens 접속"
  echo "  2. Generate new token (classic)"
  echo "  3. read:packages 권한 선택"
  echo "  4. 발급된 토큰을 .env의 GITHUB_TOKEN에 입력"
  exit 1
fi

echo "GHCR 로그인 중..."
echo "${GITHUB_TOKEN}" | docker login ghcr.io -u "${GITHUB_ACTOR}" --password-stdin

echo "이미지 pull 중... (최초 실행 시 시간이 걸립니다)"
docker compose pull

echo ""
echo "준비 완료. 아래 명령으로 전체 스택을 시작하세요:"
echo "  docker compose up -d"
