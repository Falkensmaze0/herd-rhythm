from __future__ import annotations

import asyncio
import email
import logging
from email.message import Message
from email.parser import BytesParser
from email.policy import default as default_policy
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4

from aiosmtpd.controller import Controller
from aiosmtpd.handlers import AsyncMessage

from .config import get_settings
from .interfaces.mailstore import SaveMessageInput
from .postgres_store import PostgresMailStore
from .redis_notifier import RedisMailNotifier

logger = logging.getLogger("mailcore.lmtp")
logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s %(name)s %(message)s")


class AttachmentFilesystemStore:
  def __init__(self, root: Path):
    self.root = root
    self.root.mkdir(parents=True, exist_ok=True)

  def persist(self, data: bytes, original_name: Optional[str], mime_type: Optional[str]) -> Dict[str, Any]:
    safe_name = original_name or f"attachment-{uuid4().hex}"
    path = self.root / f"{uuid4().hex}-{safe_name}"
    path.write_bytes(data)
    return {
      "file_name": safe_name,
      "file_url": str(path),
      "mime_type": mime_type,
      "size": len(data),
    }


class LocalMailHandler(AsyncMessage):
  def __init__(
    self,
    store: PostgresMailStore,
    notifier: RedisMailNotifier,
    local_domain: str,
    attachment_store: AttachmentFilesystemStore,
  ):
    super().__init__()
    self.store = store
    self.notifier = notifier
    self.local_domain = local_domain
    self.attachment_store = attachment_store

  async def handle_message(self, message: Message) -> None:
    # This method is unused because we override handle_DATA below to obtain envelope data.
    return

  async def handle_DATA(self, server, session, envelope):
    parser = BytesParser(policy=default_policy)
    mime_message = parser.parsebytes(envelope.content)
    sender_email = envelope.mail_from or mime_message.get("From")
    recipients = envelope.rcpt_tos

    if not sender_email:
      return "550 Sender required"

    sender = await self._lookup_user(sender_email)
    if not sender:
      logger.warning("Unknown sender %s", sender_email)
      return "550 Sender not allowed"

    accepted = 0
    for rcpt in recipients:
      recipient = await self._lookup_user(rcpt)
      if not recipient:
        logger.warning("Unknown recipient %s", rcpt)
        continue

      payload = await self._build_payload(mime_message, sender["id"], recipient["id"])
      record = await self.store.save_message(payload)
      await self.notifier.notify_user(
        {
          "userId": recipient["id"],
          "messageId": record["id"],
          "folder": payload.get("folder", "inbox"),
          "event": "new_mail",
        }
      )
      accepted += 1
      logger.info("Delivered local message %s -> %s", sender_email, rcpt)

    if accepted == 0:
      return "550 No recipients accepted"

    return "250 Message accepted for delivery"

  async def _lookup_user(self, email_address: str) -> Optional[Dict[str, Any]]:
    normalized = email_address.lower()
    if "@" in normalized:
      domain = normalized.split("@", 1)[1]
      if domain != self.local_domain:
        logger.debug("Skipping non-local domain %s", email_address)
        return None
    async with self.store.pool.acquire() as conn:  # type: ignore[attr-defined]
      row = await conn.fetchrow(
        'SELECT "id", "email", "name" FROM "User" WHERE lower("email") = $1',
        normalized,
      )
      if not row:
        return None
      return {"id": row["id"], "email": row["email"], "name": row["name"]}

  async def _build_payload(self, mime_message: Message, sender_id: str, recipient_id: str) -> SaveMessageInput:
    text_body, html_body = self._extract_bodies(mime_message)
    attachments = self._extract_attachments(mime_message)
    headers = {key: value for (key, value) in mime_message.items()}
    return {
      "sender_id": sender_id,
      "recipient_id": recipient_id,
      "subject": mime_message.get("Subject", "(no subject)"),
      "body": text_body,
      "body_html": html_body,
      "folder": "inbox",
      "direction": "internal",
      "metadata": {
        "headers": headers,
      },
      "lmtp_message_id": mime_message.get("Message-Id"),
      "attachments": attachments,
    }

  def _extract_bodies(self, mime_message: Message) -> tuple[Optional[str], Optional[str]]:
    if mime_message.is_multipart():
      text = None
      html = None
      for part in mime_message.walk():
        content_type = part.get_content_type()
        if content_type == "text/plain" and text is None:
          text = part.get_content()
        elif content_type == "text/html" and html is None:
          html = part.get_content()
      return text, html
    if mime_message.get_content_type() == "text/html":
      return None, mime_message.get_content()
    return mime_message.get_content(), None

  def _extract_attachments(self, mime_message: Message) -> List[Dict[str, Any]]:
    attachments: List[Dict[str, Any]] = []
    if not mime_message.is_multipart():
      return attachments
    for part in mime_message.iter_attachments():
      data = part.get_payload(decode=True)
      if not data:
        continue
      persisted = self.attachment_store.persist(data, part.get_filename(), part.get_content_type())
      attachments.append(persisted)
    return attachments


async def main() -> None:
  settings = get_settings()
  store = await PostgresMailStore.create(settings.database_url)
  notifier = RedisMailNotifier(settings.redis_url)
  attachment_store = AttachmentFilesystemStore(settings.attachment_root)
  handler = LocalMailHandler(store, notifier, settings.local_domain, attachment_store)
  controller = Controller(handler, unix_socket=settings.lmtp_socket)
  controller.start()
  logger.info("LMTP handler listening on %s", settings.lmtp_socket)
  try:
    while True:
      await asyncio.sleep(3600)
  except (KeyboardInterrupt, SystemExit):
    logger.info("Shutting down LMTP handler...")
  finally:
    controller.stop()
    await notifier.close()
    await store.close()


if __name__ == "__main__":
  asyncio.run(main())
