import { spawn } from "node:child_process";

import { IMailNotifier } from "@/interfaces/mail/IMailNotifier";
import { IMailStore, SaveMessageInput } from "@/interfaces/mail/IMailStore";
import { IMailTransport } from "@/interfaces/mail/IMailTransport";
import { MailMessage } from "@/types/mail";

const SENDMAIL_PATH = process.env.SENDMAIL_PATH || "/usr/sbin/sendmail";

export class HybridMailTransport implements IMailTransport {
  constructor(private readonly store: IMailStore, private readonly notifier: IMailNotifier) {}

  async send(payload: { to: string; subject: string; body: string; bodyHtml?: string }): Promise<void> {
    const process = spawn(SENDMAIL_PATH, ["-t", "-i"]);

    const headers = [
      `To: ${payload.to}`,
      `Subject: ${payload.subject}`,
      "MIME-Version: 1.0",
      payload.bodyHtml
        ? 'Content-Type: multipart/alternative; boundary="MAILPART"'
        : "Content-Type: text/plain; charset=utf-8",
      "",
    ].join("\n");

    process.stdin.write(headers);
    if (payload.bodyHtml) {
      process.stdin.write('--MAILPART\nContent-Type: text/plain; charset="utf-8"\n\n');
      process.stdin.write(payload.body);
      process.stdin.write('\n--MAILPART\nContent-Type: text/html; charset="utf-8"\n\n');
      process.stdin.write(payload.bodyHtml);
      process.stdin.write("\n--MAILPART--\n");
    } else {
      process.stdin.write(`${payload.body}\n`);
    }
    process.stdin.end();

    await new Promise<void>((resolve, reject) => {
      process.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`sendmail exited with code ${code}`));
        }
      });
      process.on("error", reject);
    });
  }

  async deliverLocal(payload: SaveMessageInput): Promise<MailMessage> {
    const message = await this.store.saveMessage(payload);
    await this.notifier.notifyUser({
      userId: payload.recipientId,
      messageId: message.id,
      folder: payload.folder ?? "inbox",
      event: "new_mail",
    });
    return message;
  }
}
