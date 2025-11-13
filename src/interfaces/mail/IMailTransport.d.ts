import { MailMessage } from "@/types/mail";

import { SaveMessageInput } from "./IMailStore";

export interface ExternalSendPayload {
  to: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  headers?: Record<string, string>;
}

export interface IMailTransport {
  send(payload: ExternalSendPayload): Promise<void>;
  deliverLocal(payload: SaveMessageInput): Promise<MailMessage>;
}

export type MailTransportFactory = () => IMailTransport;
