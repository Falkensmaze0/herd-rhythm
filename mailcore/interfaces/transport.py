from __future__ import annotations

from typing import Optional, Protocol, TypedDict

from .mailstore import MailMessageRecord


class ExternalSendInput(TypedDict, total=False):
  to: str
  subject: str
  body: str
  body_html: Optional[str]


class LocalDeliveryInput(TypedDict, total=False):
  sender_id: str
  recipient_id: str
  subject: str
  body: Optional[str]


class MailTransport(Protocol):
  async def send(self, payload: ExternalSendInput) -> None:
    ...

  async def deliver_local(self, payload: LocalDeliveryInput) -> MailMessageRecord:
    ...
