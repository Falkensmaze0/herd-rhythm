import { RedisMailNotifier } from "@/lib/mail/mailNotifier";
import { HybridMailTransport } from "@/lib/mail/mailTransport";
import { PrismaMailStore } from "@/lib/mail/prismaMailStore";

import { MailService } from "./mailService";

let mailService: MailService | null = null;

export const getMailService = (): MailService => {
  if (mailService) {
    return mailService;
  }

  const store = new PrismaMailStore();
  const notifier = new RedisMailNotifier();
  const transport = new HybridMailTransport(store, notifier);

  mailService = new MailService({
    store,
    notifier,
    transport,
  });

  return mailService;
};
