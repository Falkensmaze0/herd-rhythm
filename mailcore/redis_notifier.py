from __future__ import annotations

import json

from redis.asyncio import Redis

from .interfaces.notifier import MailNotifier, MailNotification


class RedisMailNotifier(MailNotifier):
  def __init__(self, redis_url: str):
    self.redis = Redis.from_url(redis_url, decode_responses=True)

  async def notify_user(self, notification: MailNotification) -> None:
    channel = f"user:{notification['userId']}"
    await self.redis.publish(channel, json.dumps(notification))

  async def close(self) -> None:
    await self.redis.close()
