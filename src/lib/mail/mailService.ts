import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { IMailNotifier } from "@/interfaces/mail/IMailNotifier";
import { IMailStore, SaveMessageInput } from "@/interfaces/mail/IMailStore";
import { IMailTransport } from "@/interfaces/mail/IMailTransport";
import {
  MailFolder,
  MailListFilters,
  MailMessage,
  MailSearchBuckets,
  MailSearchResult,
  MailSendPayload,
  MailUnreadCount,
} from "@/types/mail";

import { LOCAL_MAIL_DOMAIN } from "./constants";

interface MailServiceDeps {
  store: IMailStore;
  notifier: IMailNotifier;
  transport: IMailTransport;
}

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export class MailService {
  constructor(private readonly deps: MailServiceDeps) {}

  listMessages(userId: string, filters?: MailListFilters) {
    return this.deps.store.getMessages(userId, filters);
  }

  getMessage(userId: string, messageId: string) {
    return this.deps.store.getMessageById(messageId, userId);
  }

  markRead(userId: string, messageId: string, isRead: boolean) {
    return this.deps.store.markRead(messageId, userId, isRead);
  }

  deleteMessage(userId: string, messageId: string) {
    return this.deps.store.deleteMessage(messageId, userId);
  }

  async search(userId: string, term: string, filters?: MailListFilters): Promise<MailSearchBuckets> {
    const matches = await this.deps.store.searchMessages(userId, term);
    const selected = new Set(filters?.folders ?? filters?.folder ? [filters?.folder ?? ""] : []);

    if (!selected.size) {
      return {
        primary: matches.messages,
        secondary: [],
      };
    }

    const primary: MailMessage[] = [];
    const secondary: MailMessage[] = [];

    for (const message of matches.messages) {
      if (selected.has(message.folder)) {
        primary.push(message);
      } else {
        secondary.push(message);
      }
    }

    return { primary, secondary };
  }

  async unreadCount(userId: string): Promise<MailUnreadCount> {
    const [total, priority] = await Promise.all([
      prisma.mailMessage.count({
        where: {
          recipientId: userId,
          folder: "inbox",
          isRead: false,
          isDeleted: false,
        },
      }),
      prisma.mailMessage.count({
        where: {
          recipientId: userId,
          folder: "inbox",
          isRead: false,
          isDeleted: false,
          metadata: {
            path: ["tags"],
            array_contains: ["priority"],
          } as Prisma.JsonFilter,
        },
      }),
    ]);

    return { total, priority };
  }

  async sendMail(senderId: string, payload: MailSendPayload): Promise<{ mode: "local" | "external" }> {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { id: true, email: true },
    });
    if (!sender) {
      throw new Error("Sender not found");
    }

    const normalizedRecipient = normalizeEmail(payload.to);
    const isLocal = normalizedRecipient.endsWith(`@${LOCAL_MAIL_DOMAIN}`);
    const recipientUser = isLocal
      ? await prisma.user.findUnique({
          where: { email: normalizedRecipient },
          select: { id: true, email: true },
        })
      : null;

    if (isLocal && recipientUser) {
      const inboxRecord = await this.deps.transport.deliverLocal({
        senderId,
        recipientId: recipientUser.id,
        subject: payload.subject,
        body: payload.body,
        bodyHtml: payload.bodyHtml,
        folder: "inbox",
        direction: "internal",
        metadata: {
          tags: ["priority"],
          composer: "api",
        },
        attachments: payload.attachments,
      });

      await this.saveMessage({
        senderId,
        recipientId: senderId,
        subject: payload.subject,
        body: payload.body,
        bodyHtml: payload.bodyHtml,
        folder: "sent",
        direction: "internal",
        isRead: true,
        metadata: {
          mirrorOf: inboxRecord.id,
          to: normalizedRecipient,
        },
        attachments: payload.attachments,
      });

      await prisma.mailEvent.create({
        data: {
          messageId: inboxRecord.id,
          actorId: senderId,
          eventType: "sent",
          payload: {
            mode: "local",
            to: normalizedRecipient,
          } as Prisma.InputJsonValue,
        },
      });

      return { mode: "local" };
    }

    await this.deps.transport.send({
      to: payload.to,
      subject: payload.subject,
      body: payload.body,
      bodyHtml: payload.bodyHtml,
    });

    const sentRecord = await this.saveMessage({
      senderId,
      recipientId: senderId,
      subject: payload.subject,
      body: payload.body,
      bodyHtml: payload.bodyHtml,
      folder: "sent",
      direction: "outbound",
      isRead: true,
      metadata: {
        externalRecipient: payload.to,
      },
      attachments: payload.attachments,
    });

    await prisma.mailEvent.create({
      data: {
        messageId: sentRecord.id,
        actorId: senderId,
        eventType: "sent",
        payload: {
          mode: "external",
          to: payload.to,
        } as Prisma.InputJsonValue,
      },
    });

    return { mode: "external" };
  }

  async updateFolder(userId: string, messageId: string, folder: MailFolder): Promise<MailMessage | null> {
    return this.deps.store.updateFolder(messageId, userId, folder);
  }

  async updateTags(userId: string, messageId: string, tags: string[]): Promise<MailMessage | null> {
    return this.deps.store.updateTags(messageId, userId, tags);
  }

  private saveMessage(payload: SaveMessageInput): Promise<MailMessage> {
    return this.deps.store.saveMessage(payload);
  }
}
