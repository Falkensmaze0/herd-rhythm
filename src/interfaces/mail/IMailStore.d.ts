import { MailFolder, MailListFilters, MailMessage, MailSearchResult } from "@/types/mail";

export interface SaveMessageInput {
  senderId: string;
  recipientId: string;
  subject: string;
  body?: string | null;
  bodyHtml?: string | null;
  direction?: "internal" | "outbound" | "inbound";
  folder?: "inbox" | "sent" | "archived" | "trash";
  isRead?: boolean;
  metadata?: Record<string, unknown> | null;
  lmtpMessageId?: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    mimeType?: string;
    size?: number;
  }>;
}

export interface IMailStore {
  saveMessage(payload: SaveMessageInput): Promise<MailMessage>;
  getMessages(userId: string, filters?: MailListFilters): Promise<MailMessage[]>;
  getMessageById(id: string, userId: string): Promise<MailMessage | null>;
  markRead(id: string, userId: string, isRead: boolean): Promise<MailMessage | null>;
  deleteMessage(id: string, userId: string): Promise<void>;
  searchMessages(userId: string, term: string): Promise<MailSearchResult>;
  updateFolder(id: string, userId: string, folder: MailFolder): Promise<MailMessage | null>;
  updateTags(id: string, userId: string, tags: string[]): Promise<MailMessage | null>;
}

export type MailStoreFactory = () => IMailStore;
