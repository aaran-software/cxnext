#!/bin/sh
set -eu

APP_ROOT="/opt/cxnext/app"
RUNTIME_ROOT="/opt/cxnext/runtime"
RUNTIME_ENV_FILE="$RUNTIME_ROOT/.env"
RUNTIME_STORAGE_ROOT="$RUNTIME_ROOT/storage"
SOURCE_ROOT="$APP_ROOT"

log() {
  printf '%s\n' "$1"
}

ensure_runtime_env_file() {
  mkdir -p "$RUNTIME_ROOT"

  if [ ! -f "$RUNTIME_ENV_FILE" ]; then
    cp "$APP_ROOT/.env.example" "$RUNTIME_ENV_FILE"
  fi
}

prepare_source_layout() {
  target_root="$1"

  mkdir -p "$RUNTIME_STORAGE_ROOT/public" "$RUNTIME_STORAGE_ROOT/private"

  rm -rf "$target_root/storage"
  ln -sfn "$RUNTIME_STORAGE_ROOT" "$target_root/storage"

  mkdir -p "$target_root/apps/web/public"
  rm -rf "$target_root/apps/web/public/storage"
  ln -sfn "$RUNTIME_STORAGE_ROOT/public" "$target_root/apps/web/public/storage"

  rm -f "$target_root/.env"
  ln -sfn "$RUNTIME_ENV_FILE" "$target_root/.env"
}

load_runtime_env() {
  eval "$(node - "$RUNTIME_ENV_FILE" <<'NODE'
const fs = require('fs')
const dotenv = require('dotenv')

const envFilePath = process.argv[2]
const env = dotenv.parse(fs.readFileSync(envFilePath, 'utf8'))
const keys = [
  'GIT_SYNC_ENABLED',
  'GIT_AUTO_UPDATE_ON_START',
  'GIT_FORCE_UPDATE_ON_START',
  'GIT_REPOSITORY_URL',
  'GIT_BRANCH',
  'INSTALL_DEPS_ON_START',
  'BUILD_ON_START',
]

for (const key of keys) {
  const value = env[key] ?? ''
  console.log(`export ${key}=${JSON.stringify(value)}`)
}
NODE
)"
}

update_runtime_env_value() {
  node - "$RUNTIME_ENV_FILE" "$1" "$2" <<'NODE'
const fs = require('fs')

const envFilePath = process.argv[2]
const key = process.argv[3]
const value = process.argv[4]
const existingRaw = fs.readFileSync(envFilePath, 'utf8')
const lines = existingRaw.split(/\r?\n/)
let updated = false

const nextLines = lines.map((line) => {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/)

  if (!match || match[1] !== key) {
    return line
  }

  updated = true
  return `${key}=${value}`
})

if (!updated) {
  if (nextLines.length > 0 && nextLines[nextLines.length - 1] !== '') {
    nextLines.push('')
  }

  nextLines.push(`${key}=${value}`)
}

fs.writeFileSync(envFilePath, `${nextLines.join('\n').replace(/\n*$/, '\n')}`, 'utf8')
NODE
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

sync_from_git() {
  if [ -z "${GIT_REPOSITORY_URL:-}" ]; then
    log "GIT_REPOSITORY_URL is required when GIT_SYNC_ENABLED=true."
    exit 1
  fi

  SOURCE_ROOT="$RUNTIME_ROOT/source"
  should_refresh_source="false"

  if [ -d "$SOURCE_ROOT" ] && [ ! -d "$SOURCE_ROOT/.git" ]; then
    log "Runtime source directory exists but is not a Git checkout: $SOURCE_ROOT"
    exit 1
  fi

  if [ -d "$SOURCE_ROOT/.git" ] && [ "${GIT_FORCE_UPDATE_ON_START:-false}" != "true" ] && [ "${GIT_AUTO_UPDATE_ON_START:-false}" != "true" ]; then
    log "Using existing runtime Git source checkout without pulling updates."
  elif [ -d "$SOURCE_ROOT/.git" ]; then
    log "Updating source from Git..."
    git -C "$SOURCE_ROOT" fetch --depth 1 origin "${GIT_BRANCH:-main}"
    git -C "$SOURCE_ROOT" checkout "${GIT_BRANCH:-main}"
    git -C "$SOURCE_ROOT" pull --ff-only origin "${GIT_BRANCH:-main}"
    should_refresh_source="true"
  else
    log "Cloning source from Git..."
    git clone --branch "${GIT_BRANCH:-main}" --depth 1 "$GIT_REPOSITORY_URL" "$SOURCE_ROOT"
    should_refresh_source="true"
  fi

  prepare_source_layout "$SOURCE_ROOT"
  cd "$SOURCE_ROOT"

  if [ "$should_refresh_source" = "true" ] || [ ! -d node_modules ]; then
    run_npm_install
  fi

  if [ "$should_refresh_source" = "true" ] || [ ! -f apps/api/dist/server.js ] || [ ! -f apps/web/dist/index.html ]; then
    build_source
  fi

  if [ "${GIT_FORCE_UPDATE_ON_START:-false}" = "true" ]; then
    update_runtime_env_value "GIT_FORCE_UPDATE_ON_START" "false"
  fi
}

ensure_runtime_env_file
prepare_source_layout "$APP_ROOT"
load_runtime_env

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
