import { MailAttachment, MailMessage } from "@/types/mail";
import { MailAttachment as PrismaMailAttachment, MailMessage as PrismaMailMessage, User } from "@prisma/client";
import { Prisma } from "@prisma/client";

type MailMessageRecord = PrismaMailMessage & {
  sender: Pick<User, "id" | "name" | "email">;
  recipient: Pick<User, "id" | "name" | "email">;
  attachments: PrismaMailAttachment[];
};

const toTagList = (metadata: Prisma.JsonValue | null | undefined): string[] => {
  if (!metadata || typeof metadata !== "object") {
    return [];
  }
  if (!("tags" in metadata)) {
    return [];
  }
  const tags = (metadata as { tags?: unknown }).tags;
  if (!Array.isArray(tags)) {
    return [];
  }
  return tags.map((tag) => String(tag));
};

const mapAttachments = (attachments: PrismaMailAttachment[]): MailAttachment[] =>
  attachments.map((attachment) => ({
    id: attachment.id,
    messageId: attachment.messageId,
    fileName: attachment.fileName,
    fileUrl: attachment.fileUrl,
    mimeType: attachment.mimeType ?? undefined,
    size: attachment.size ?? undefined,
    createdAt: attachment.createdAt.toISOString(),
  }));

export const mapMailMessage = (record: MailMessageRecord): MailMessage => ({
  id: record.id,
  senderId: record.senderId,
  senderName: record.sender.name,
  senderEmail: record.sender.email,
  recipientId: record.recipientId,
  recipientName: record.recipient.name,
  recipientEmail: record.recipient.email,
  subject: record.subject,
  body: record.body,
  bodyHtml: record.bodyHtml,
  isRead: record.isRead,
  folder: record.folder,
  direction: record.direction,
  isDeleted: record.isDeleted,
  metadata: (record.metadata as Record<string, unknown> | null | undefined) ?? null,
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString(),
  attachments: mapAttachments(record.attachments),
  tags: toTagList(record.metadata),
});
