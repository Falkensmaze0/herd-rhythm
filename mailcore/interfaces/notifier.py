from __future__ import annotations

from typing import Any, Dict, Protocol


class MailNotification(Dict[str, Any]):
  userId: str
  messageId: str
  event: str
  folder: str


class MailNotifier(Protocol):
  async def notify_user(self, notification: MailNotification) -> None:
    ...
