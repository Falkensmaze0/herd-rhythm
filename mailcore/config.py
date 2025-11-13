from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


@dataclass
class MailCoreSettings:
  database_url: str
  redis_url: str
  lmtp_socket: str
  local_domain: str
  attachment_root: Path


def get_settings() -> MailCoreSettings:
  database_url = os.environ.get("DATABASE_URL")
  if not database_url:
    raise RuntimeError("DATABASE_URL is required for mailcore")

  redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379")
  lmtp_socket = os.environ.get("LMTP_SOCKET", "/var/run/mailpipe.sock")
  local_domain = os.environ.get("LOCAL_MAIL_DOMAIN", "farm.com")
  attachment_root = Path(os.environ.get("MAIL_ATTACHMENT_ROOT", "storage/mail"))

  return MailCoreSettings(
    database_url=database_url,
    redis_url=redis_url,
    lmtp_socket=lmtp_socket,
    local_domain=local_domain,
    attachment_root=attachment_root,
  )
