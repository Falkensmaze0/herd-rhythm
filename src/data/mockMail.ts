import { MailDirection, MailFolder } from "@prisma/client";

export interface MockMailAttachment {
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  size?: number;
}

export interface MockMailMessage {
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  folder?: MailFolder;
  isRead?: boolean;
  direction?: MailDirection;
  metadata?: Record<string, unknown>;
  attachments?: MockMailAttachment[];
}

export const mockMailMessages: MockMailMessage[] = [
  {
    senderEmail: "admin@farm.com",
    recipientEmail: "manager@farm.com",
    subject: "FleetOps handoff – compliance evidence uploaded",
    body: "Technician pod shared documents for the quarterly audit window. Please sign off before Friday.",
    folder: "inbox",
    metadata: { priority: "high", tags: ["compliance", "handoff"] },
  },
  {
    senderEmail: "manager@farm.com",
    recipientEmail: "admin@farm.com",
    subject: "Escalation resolved: device drift",
    body: "Technician crew contained drift across barn cluster B. No further action required.",
    folder: "inbox",
    isRead: true,
    metadata: { tags: ["ops", "update"] },
  },
  {
    senderEmail: "doctor@farm.com",
    recipientEmail: "helper@farm.com",
    subject: "Helper note: hydration variance follow-up",
    body: "Please add vitals for the hydration note flagged yesterday. Thanks!",
    metadata: { tags: ["clinical"] },
  },
  {
    senderEmail: "helper@farm.com",
    recipientEmail: "doctor@farm.com",
    subject: "Vitals anomaly resolved",
    body: "Sensors reverted to normal after scheduled flush. Logging for awareness.",
    isRead: true,
    metadata: { tags: ["automation"] },
  },
  {
    senderEmail: "office@farm.com",
    recipientEmail: "admin@farm.com",
    subject: "Vendor renewal packet ready for signature",
    body: "Pasture Labs updated SLA + price lock. Packet attached.",
    attachments: [
      {
        fileName: "pasture-labs-sla.pdf",
        fileUrl: "https://example.com/pasture-labs-sla.pdf",
        mimeType: "application/pdf",
        size: 384000,
      },
    ],
    metadata: { tags: ["vendor", "priority"] },
  },
  {
    senderEmail: "technician@farm.com",
    recipientEmail: "manager@farm.com",
    subject: "Rover 44 drive calibration drift",
    body: "Automation paused the route pending your sign-off.",
    metadata: { tags: ["automation"] },
  },
  {
    senderEmail: "office@farm.com",
    recipientEmail: "manager@farm.com",
    subject: "Budget sync ready for review",
    body: "Office team attached annotated ledger for Q1 planning.",
    isRead: true,
    metadata: { tags: ["finance"] },
  },
  {
    senderEmail: "manager@farm.com",
    recipientEmail: "office@farm.com",
    subject: "Spend telemetry packet",
    body: "Here are the spend telemetry notes from leadership.",
    direction: "internal",
    folder: "sent",
    metadata: { tags: ["finance", "leadership"] },
  },
];
