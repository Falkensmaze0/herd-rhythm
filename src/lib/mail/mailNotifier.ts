import { EventEmitter } from "node:events";

import { IMailNotifier, MailNotification } from "@/interfaces/mail/IMailNotifier";

import { getRedisPublisher } from "./redis";

const emitter = new EventEmitter();

export class RedisMailNotifier implements IMailNotifier {
  private readonly client = getRedisPublisher();

  async notifyUser(notification: MailNotification): Promise<void> {
    emitter.emit(notification.userId, notification);
    await this.client.publish(`user:${notification.userId}`, JSON.stringify(notification));
  }
}

export const getMailEventEmitter = () => emitter;
