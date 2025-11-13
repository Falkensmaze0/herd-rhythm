import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { IMailStore, SaveMessageInput } from "@/interfaces/mail/IMailStore";
import { MailFolder, MailListFilters, MailMessage, MailSearchResult } from "@/types/mail";

import { mapMailMessage } from "./mappers";
import { MAX_INBOX_RESULTS } from "./constants";

const defaultSelect = {
  sender: {
    select: { id: true, name: true, email: true },
  },
  recipient: {
    select: { id: true, name: true, email: true },
  },
  attachments: true,
};

export class PrismaMailStore implements IMailStore {
  async saveMessage(payload: SaveMessageInput): Promise<MailMessage> {
    const record = await prisma.mailMessage.create({
      data: {
        senderId: payload.senderId,
        recipientId: payload.recipientId,
        subject: payload.subject,
        body: payload.body,
        bodyHtml: payload.bodyHtml,
        direction: payload.direction ?? "internal",
        folder: payload.folder ?? "inbox",
        isRead: payload.isRead ?? false,
        metadata: payload.metadata as Prisma.InputJsonValue,
        lmtpMessageId: payload.lmtpMessageId,
        attachments: payload.attachments
          ? {
              create: payload.attachments.map((attachment) => ({
                fileName: attachment.fileName,
                fileUrl: attachment.fileUrl,
                mimeType: attachment.mimeType,
                size: attachment.size,
              })),
            }
          : undefined,
      },
      include: defaultSelect,
    });
    return mapMailMessage(record);
  }

  async getMessages(userId: string, filters?: MailListFilters): Promise<MailMessage[]> {
    const folderList =
      (filters?.folders && filters.folders.length ? filters.folders : filters?.folder ? [filters.folder] : null) ??
      ["inbox"];

    const orStatements = folderList.map((folder) => ({
      AND: [
        { folder },
        {
          OR: [
            {
              recipientId: userId,
            },
            {
              senderId: userId,
            },
          ],
        },
      ],
    }));

    const where: Prisma.MailMessageWhereInput = {
      OR: orStatements,
      isDeleted: false,
    };

    if (filters?.onlyUnread) {
      where.isRead = false;
    }

    if (filters?.tags?.length) {
      where.metadata = {
        path: ["tags"],
        array_contains: filters.tags,
      } as Prisma.JsonFilter;
    }

    const messages = await prisma.mailMessage.findMany({
      where,
      orderBy: {
        createdAt: filters?.sort === "date-asc" ? "asc" : "desc",
      },
      take: filters?.limit ?? MAX_INBOX_RESULTS,
      skip: filters?.offset ?? 0,
      include: defaultSelect,
    });

    return messages.map(mapMailMessage);
  }

  async getMessageById(id: string, userId: string): Promise<MailMessage | null> {
    const message = await prisma.mailMessage.findFirst({
      where: {
        id,
        OR: [{ recipientId: userId }, { senderId: userId }],
      },
      include: defaultSelect,
    });
    return message ? mapMailMessage(message) : null;
  }

  async markRead(id: string, userId: string, isRead: boolean): Promise<MailMessage | null> {
    const record = await prisma.mailMessage.updateMany({
      where: {
        id,
        recipientId: userId,
      },
      data: {
        isRead,
      },
    });

    if (!record.count) {
      return null;
    }
    return this.getMessageById(id, userId);
  }

  async deleteMessage(id: string, userId: string): Promise<void> {
    await prisma.mailMessage.updateMany({
      where: {
        id,
        OR: [{ recipientId: userId }, { senderId: userId }],
      },
      data: {
        isDeleted: false,
        folder: "trash",
      },
    });
  }

  async searchMessages(userId: string, term: string): Promise<MailSearchResult> {
    if (!term.trim()) {
      return { messages: [], total: 0 };
    }

    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
      }>
    >`
      SELECT "id"
      FROM "MailMessage"
      WHERE ("recipientId" = ${userId} OR "senderId" = ${userId})
        AND "isDeleted" = false
        AND to_tsvector('english', coalesce("subject", '') || ' ' || coalesce("body", ''))
          @@ plainto_tsquery('english', ${term})
      ORDER BY "createdAt" DESC
      LIMIT 50
    `;

    if (!rows.length) {
      return { messages: [], total: 0 };
    }

    const messages = await prisma.mailMessage.findMany({
      where: {
        id: {
          in: rows.map((row) => row.id),
        },
      },
      include: defaultSelect,
    });

    return {
      messages: messages.map(mapMailMessage),
      total: rows.length,
    };
  }

  async updateFolder(id: string, userId: string, folder: MailFolder): Promise<MailMessage | null> {
    const result = await prisma.mailMessage.updateMany({
      where: {
        id,
        OR: [{ recipientId: userId }, { senderId: userId }],
      },
      data: {
        folder,
        isDeleted: false,
      },
    });

    if (!result.count) {
      return null;
    }

    return this.getMessageById(id, userId);
  }

  async updateTags(id: string, userId: string, tags: string[]): Promise<MailMessage | null> {
    const message = await prisma.mailMessage.findFirst({
      where: {
        id,
        OR: [{ recipientId: userId }, { senderId: userId }],
      },
      select: {
        metadata: true,
      },
    });

    if (!message) {
      return null;
    }

    const metadata =
      (message.metadata && typeof message.metadata === "object"
        ? (message.metadata as Record<string, unknown>)
        : {}) ?? {};

    metadata.tags = tags;

    await prisma.mailMessage.update({
      where: { id },
      data: {
        metadata: metadata as Prisma.InputJsonValue,
      },
    });

    return this.getMessageById(id, userId);
  }
}
