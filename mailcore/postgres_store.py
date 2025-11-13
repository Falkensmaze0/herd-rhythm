from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

import asyncpg

from .interfaces.mailstore import MailMessageRecord, MailStore, SaveMessageInput


def _serialize_metadata(metadata: Optional[Dict[str, Any]]) -> Optional[str]:
  if metadata is None:
    return None
  return json.dumps(metadata)


class PostgresMailStore(MailStore):
  def __init__(self, pool: asyncpg.Pool):
    self.pool = pool

  @classmethod
  async def create(cls, dsn: str) -> "PostgresMailStore":
    pool = await asyncpg.create_pool(dsn)
    return cls(pool)

  async def close(self) -> None:
    await self.pool.close()

  async def save_message(self, payload: SaveMessageInput) -> MailMessageRecord:
    async with self.pool.acquire() as conn:
      async with conn.transaction():
        record = await conn.fetchrow(
          """
          INSERT INTO "MailMessage" ("senderId", "recipientId", "subject", "body", "bodyHtml", "direction", "folder", "isRead", "metadata", "lmtpMessageId")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
          RETURNING "id", "senderId", "recipientId", "subject", "body", "folder", "isRead", "createdAt"
          """,
          payload["sender_id"],
          payload["recipient_id"],
          payload["subject"],
          payload.get("body"),
          payload.get("body_html"),
          payload.get("direction", "internal"),
          payload.get("folder", "inbox"),
          payload.get("is_read", False),
          _serialize_metadata(payload.get("metadata")),
          payload.get("lmtp_message_id"),
        )

        attachments = payload.get("attachments") or []
        if attachments:
          attachment_rows = [
            (
              record["id"],
              attachment["file_name"],
              attachment["file_url"],
              attachment.get("mime_type"),
              attachment.get("size"),
            )
            for attachment in attachments
          ]
          await conn.executemany(
            """
            INSERT INTO "MailAttachment" ("messageId", "fileName", "fileUrl", "mimeType", "size")
            VALUES ($1, $2, $3, $4, $5)
            """,
            attachment_rows,
          )

    return {
      "id": record["id"],
      "sender_id": record["senderId"],
      "recipient_id": record["recipientId"],
      "subject": record["subject"],
      "body": record["body"],
      "folder": record["folder"],
      "is_read": record["isread"],
    }

  async def mark_read(self, message_id: str, user_id: str, is_read: bool) -> MailMessageRecord:
    async with self.pool.acquire() as conn:
      record = await conn.fetchrow(
        """
        UPDATE "MailMessage"
        SET "isRead" = $1
        WHERE "id" = $2 AND "recipientId" = $3
        RETURNING "id", "senderId", "recipientId", "subject", "body", "folder", "isRead"
        """,
        is_read,
        message_id,
        user_id,
      )
      if not record:
        raise ValueError("Message not found or not owned by user")
      return {
        "id": record["id"],
        "sender_id": record["senderId"],
        "recipient_id": record["recipientId"],
        "subject": record["subject"],
        "body": record["body"],
        "folder": record["folder"],
        "is_read": record["isread"],
      }

  async def get_messages(self, user_id: str, folder: str = "inbox") -> List[MailMessageRecord]:
    async with self.pool.acquire() as conn:
      rows = await conn.fetch(
        """
        SELECT "id", "senderId", "recipientId", "subject", "body", "folder", "isRead"
        FROM "MailMessage"
        WHERE "recipientId" = $1 AND "folder" = $2 AND "isDeleted" = false
        ORDER BY "createdAt" DESC
        LIMIT 100
        """,
        user_id,
        folder,
      )
      return [
        {
          "id": row["id"],
          "sender_id": row["senderId"],
          "recipient_id": row["recipientId"],
          "subject": row["subject"],
          "body": row["body"],
          "folder": row["folder"],
          "is_read": row["isread"],
        }
        for row in rows
      ]
