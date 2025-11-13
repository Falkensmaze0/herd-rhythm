import { UserRole } from "@/types";

export type MailFolder = "inbox" | "sent" | "archived" | "trash";

export type MailDirection = "internal" | "outbound" | "inbound";

export type MailSortOption = "date-desc" | "date-asc";

export type MailEventType =
  | "received"
  | "delivered"
  | "read"
  | "unread"
  | "deleted"
  | "restored"
  | "sent"
  | "bounced";

export interface MailAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
}

export interface MailEvent {
  id: string;
  messageId: string;
  actorId?: string;
  eventType: MailEventType;
  description?: string;
  payload?: Record<string, unknown> | null;
  createdAt: string;
}

export interface MailMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body?: string | null;
  bodyHtml?: string | null;
  isRead: boolean;
  folder: MailFolder;
  direction: MailDirection;
  isDeleted: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  attachments: MailAttachment[];
  tags: string[];
}

export interface MailListFilters {
  folder?: MailFolder;
  folders?: MailFolder[];
  limit?: number;
  offset?: number;
  onlyUnread?: boolean;
  search?: string;
  sort?: MailSortOption;
  tags?: string[];
}

export interface MailSearchResult {
  messages: MailMessage[];
  total: number;
}

export interface MailSearchBuckets {
  primary: MailMessage[];
  secondary: MailMessage[];
}

export interface MailUnreadCount {
  total: number;
  priority: number;
}

export interface MailSendPayload {
  to: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  attachments?: Array<{
    fileName: string;
    mimeType?: string;
    size?: number;
    fileUrl?: string;
  }>;
}

export interface MailNotificationPayload {
  messageId: string;
  recipientId: string;
  folder: MailFolder;
  event: "new_mail" | "updated_mail";
}

export interface RoleInboxCopy {
  role: UserRole;
  kicker: string;
  description: string;
  highlights: Array<{ label: string; value: string; hint?: string }>;
  automation: Array<{ title: string; description: string; status: string }>;
  defaultFilters: string[];
}
