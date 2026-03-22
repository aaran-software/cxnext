#!/bin/sh
set -eu

APP_ROOT="/opt/cxnext/app"
RUNTIME_ROOT="/opt/cxnext/runtime"
SOURCE_ROOT="$APP_ROOT"

log() {
  printf '%s\n' "$1"
}

run_npm_install() {
  if [ -f package-lock.json ]; then
    npm ci
    return
  fi

  npm install
}

build_source() {
  npm run build:server
}

prepare_runtime_directories() {
  mkdir -p "$RUNTIME_ROOT"

  if [ -n "${RUNTIME_CONFIG_PATH:-}" ]; then
    mkdir -p "$(dirname "$RUNTIME_CONFIG_PATH")"
  fi

  if [ -n "${MEDIA_STORAGE_ROOT:-}" ]; then
    mkdir -p "$MEDIA_STORAGE_ROOT"
  fi
}

sync_from_git() {
  if [ -z "${GIT_REPOSITORY_URL:-}" ]; then
    log "GIT_REPOSITORY_URL is required when GIT_SYNC_ENABLED=true."
    exit 1
  fi

  SOURCE_ROOT="$RUNTIME_ROOT/source"

  if [ -d "$SOURCE_ROOT" ] && [ ! -d "$SOURCE_ROOT/.git" ]; then
    log "Runtime source directory exists but is not a Git checkout: $SOURCE_ROOT"
    exit 1
  fi

  if [ -d "$SOURCE_ROOT/.git" ]; then
    log "Updating source from Git..."
    git -C "$SOURCE_ROOT" fetch --depth 1 origin "${GIT_BRANCH:-main}"
    git -C "$SOURCE_ROOT" checkout "${GIT_BRANCH:-main}"
    git -C "$SOURCE_ROOT" pull --ff-only origin "${GIT_BRANCH:-main}"
  else
    log "Cloning source from Git..."
    git clone --branch "${GIT_BRANCH:-main}" --depth 1 "$GIT_REPOSITORY_URL" "$SOURCE_ROOT"
  fi

  cd "$SOURCE_ROOT"
  run_npm_install
  build_source
}

prepare_runtime_directories

if [ "${GIT_SYNC_ENABLED:-false}" = "true" ]; then
  sync_from_git
else
  cd "$APP_ROOT"

  if [ "${INSTALL_DEPS_ON_START:-false}" = "true" ]; then
    log "Installing dependencies on container start..."
    run_npm_install
  fi

  if [ "${BUILD_ON_START:-false}" = "true" ]; then
    log "Building application on container start..."
    build_source
  fi
fi

cd "$SOURCE_ROOT"
log "Starting CXNext API and static web server..."
exec node apps/api/dist/server.js
