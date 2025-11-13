#!/usr/bin/env tsx
import "dotenv/config";

import { prisma } from "../src/lib/prisma";
import { getMailService } from "../src/lib/mail/factory";

const mailService = getMailService();

async function main() {
  const senderId = "manager-001";
  const recipientEmail = "admin@farm.com";

  console.log("→ Sending local message manager → admin");
  await mailService.sendMail(senderId, {
    to: recipientEmail,
    subject: "Test message",
    body: "This is an automated verification from scripts/test-mail-flow.ts",
  });

  console.log("→ Fetching admin inbox");
  const user = await prisma.user.findUnique({ where: { email: recipientEmail } });
  if (!user) {
    throw new Error("Admin user not found");
  }
  const inbox = await mailService.listMessages(user.id, { folder: "inbox" });
  console.log(`✓ Admin inbox now has ${inbox.length} messages. Latest: ${inbox[0]?.subject}`);
}

main()
  .catch((error) => {
    console.error("Mail flow test failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
