#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-$HOME/service/apps/at-fan}"
REPO_URL="${REPO_URL:-https://github.com/qoweh/at-fan.git}"
BRANCH="${BRANCH:-main}"

if [ ! -d "$APP_DIR/.git" ]; then
  if [ -e "$APP_DIR" ]; then
    echo "$APP_DIR exists but is not a git repository."
    exit 1
  fi

  mkdir -p "$(dirname "$APP_DIR")"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
git remote set-url origin "$REPO_URL"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"
docker compose up -d --build
