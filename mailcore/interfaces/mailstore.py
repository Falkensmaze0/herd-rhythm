from __future__ import annotations

from typing import Any, Dict, List, Optional, Protocol, TypedDict


class AttachmentInput(TypedDict, total=False):
  file_name: str
  file_url: str
  mime_type: Optional[str]
  size: Optional[int]


class SaveMessageInput(TypedDict, total=False):
  sender_id: str
  recipient_id: str
  subject: str
  body: Optional[str]
  body_html: Optional[str]
  direction: str
  folder: str
  is_read: Optional[bool]
  metadata: Optional[Dict[str, Any]]
  lmtp_message_id: Optional[str]
  attachments: List[AttachmentInput]


class MailMessageRecord(TypedDict, total=False):
  id: str
  sender_id: str
  recipient_id: str
  subject: str
  body: Optional[str]
  folder: str
  is_read: bool


class MailStore(Protocol):
  async def save_message(self, payload: SaveMessageInput) -> MailMessageRecord:
    ...

  async def mark_read(self, message_id: str, user_id: str, is_read: bool) -> MailMessageRecord:
    ...

  async def get_messages(self, user_id: str, folder: str = "inbox") -> List[MailMessageRecord]:
    ...
