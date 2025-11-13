export interface MailNotification {
  userId: string;
  messageId: string;
  event: "new_mail" | "updated_mail";
  folder: "inbox" | "sent" | "archived" | "trash";
  metadata?: Record<string, unknown>;
}

export interface IMailNotifier {
  notifyUser(notification: MailNotification): Promise<void>;
}

export type MailNotifierFactory = () => IMailNotifier;
