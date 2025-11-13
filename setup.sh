#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Hybrid Mail Setup

Usage:
  ./setup.sh [options]

Options:
  --skip-node        Skip npm install + Prisma sync/seed
  --skip-python      Skip Python virtualenv setup
  --skip-redis       Do not attempt to launch a local Redis instance
  --skip-lmtp        Do not auto-start the LMTP handler
  -h, --help         Show this help message

The script installs dependencies, syncs the Prisma schema, provisions the
mailcore virtualenv, optionally starts Redis, and daemonizes the LMTP handler.
EOF
}

START_REDIS=true
START_LMTP=true
INSTALL_NODE=true
INSTALL_PYTHON=true

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-node) INSTALL_NODE=false ;;
    --skip-python) INSTALL_PYTHON=false ;;
    --skip-redis) START_REDIS=false ;;
    --skip-lmtp) START_LMTP=false ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
  shift
done

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="${ROOT_DIR}/.venv-mailcore"
LOG_DIR="${ROOT_DIR}/.mailcore"
LMTP_LOG="${LOG_DIR}/lmtp.log"
LMTP_PID="${LOG_DIR}/.lmtp.pid"
LOCAL_MAIL_DOMAIN_VALUE="${LOCAL_MAIL_DOMAIN:-farm.com}"

mkdir -p "${LOG_DIR}" "${ROOT_DIR}/storage/mail"

info() { printf "\033[1;34m[setup]\033[0m %s\n" "$1"; }
warn() { printf "\033[1;33m[warn]\033[0m %s\n" "$1"; }
success() { printf "\033[1;32m[ok]\033[0m %s\n" "$1"; }

ensure_env_file() {
  if [[ ! -f "${ROOT_DIR}/.env" ]]; then
    info "No .env detected; copying from .env.example"
    cp "${ROOT_DIR}/.env.example" "${ROOT_DIR}/.env"
  fi
}

install_node_stack() {
  $INSTALL_NODE || { info "Skipping Node.js dependency install (per flag)"; return; }
  info "Installing Node dependencies…"
  (cd "${ROOT_DIR}" && npm install)

  info "Syncing Prisma schema…"
  (cd "${ROOT_DIR}" && npx prisma db push)

  info "Seeding PostgreSQL with sample data…"
  (cd "${ROOT_DIR}" && npm run db:seed)
}

install_python_stack() {
  $INSTALL_PYTHON || { info "Skipping Python virtualenv setup (per flag)"; return; }
  if [[ ! -d "${VENV_DIR}" ]]; then
    info "Creating Python virtualenv at ${VENV_DIR}"
    python3 -m venv "${VENV_DIR}"
  fi

  info "Installing mailcore Python requirements…"
  # shellcheck source=/dev/null
  source "${VENV_DIR}/bin/activate"
  pip install --upgrade pip >/dev/null
  pip install -r "${ROOT_DIR}/mailcore/requirements.txt"
  deactivate
}

start_redis() {
  $START_REDIS || { info "Skipping Redis bootstrap (per flag)"; return; }

  if ! command -v redis-server >/dev/null 2>&1; then
    warn "redis-server not found in PATH. Install Redis or provide REDIS_URL to an existing instance."
    return
  fi

  if command -v redis-cli >/dev/null 2>&1 && redis-cli ping >/dev/null 2>&1; then
    success "Redis is already running."
    return
  fi

  info "Starting redis-server (daemonized)…"
  if redis-server --daemonize yes >/dev/null 2>&1; then
    success "Redis launched. (Use redis-cli ping to verify.)"
  else
    warn "Unable to auto-start redis-server. Start it manually or point REDIS_URL elsewhere."
  fi
}

start_lmtp_handler() {
  $START_LMTP || { info "Skipping LMTP handler bootstrap (per flag)"; return; }

  if [[ ! -d "${VENV_DIR}" ]]; then
    warn "Virtualenv not found; skipping LMTP start. Re-run without --skip-python."
    return
  fi

  if [[ -f "${LMTP_PID}" ]] && kill -0 "$(cat "${LMTP_PID}")" >/dev/null 2>&1; then
    info "Existing LMTP handler detected (PID $(cat "${LMTP_PID}")). Skipping restart."
    return
  fi

  info "Daemonizing mailcore LMTP handler…"
  # shellcheck source=/dev/null
  source "${VENV_DIR}/bin/activate"
  nohup python "${ROOT_DIR}/mailcore/lmtp_handler.py" >"${LMTP_LOG}" 2>&1 &
  LMTP_PID_VALUE=$!
  deactivate
  echo "${LMTP_PID_VALUE}" >"${LMTP_PID}"
  success "LMTP handler running (PID ${LMTP_PID_VALUE}). Logs: ${LMTP_LOG}"
}

postfix_reminder() {
  if command -v postfix >/dev/null 2>&1; then
    info "Postfix detected at $(command -v postfix). Ensure main.cf routes ${LOCAL_MAIL_DOMAIN_VALUE} to lmtp:unix:/var/run/mailpipe.sock (see README)."
  else
    warn "Postfix not found. Configure your host MTA to deliver local mail to the LMTP socket."
  fi
}

summary() {
  cat <<'EOF'

✅ Setup complete.

Next steps:
  • Ensure DATABASE_URL, REDIS_URL, and LOCAL_MAIL_DOMAIN are correct in .env
  • Start Next.js in another terminal: npm run dev
  • (Optional) Run npm run mail:test to validate local delivery
  • Tail LMTP logs with: tail -f .mailcore/lmtp.log

See README.md for full Postfix configuration details.
EOF
}

ensure_env_file
install_node_stack
install_python_stack
start_redis
start_lmtp_handler
postfix_reminder
summary
