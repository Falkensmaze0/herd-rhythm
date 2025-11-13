import { z } from "zod";

import { MailFolder, MailSortOption } from "@/types/mail";

const FOLDERS: MailFolder[] = ["inbox", "sent", "archived", "trash"];

const sanitizeFolderList = (value?: string | string[]): MailFolder[] | undefined => {
  if (!value) {
    return undefined;
  }
  const raw = Array.isArray(value) ? value : value.split(",");
  const normalized = raw
    .map((folder) => folder.trim())
    .filter((folder) => FOLDERS.includes(folder as MailFolder)) as MailFolder[];
  return normalized.length ? normalized : undefined;
};

const sanitizeStringList = (value?: string | string[]): string[] | undefined => {
  if (!value) return undefined;
  const raw = Array.isArray(value) ? value : value.split(",");
  const normalized = raw.map((entry) => entry.trim()).filter(Boolean);
  return normalized.length ? normalized : undefined;
};

export const MailSendSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  bodyHtml: z.string().optional(),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        mimeType: z.string().optional(),
        size: z.number().optional(),
        fileUrl: z.string().url().optional(),
      })
    )
    .optional(),
});

export const MailQuerySchema = z.object({
  folder: z.enum(FOLDERS).optional(),
  folders: z.any().optional().transform((value) => sanitizeFolderList(value)),
  tags: z.any().optional().transform((value) => sanitizeStringList(value)),
  sort: z.enum(["date-desc", "date-asc"]).optional(),
  search: z.string().optional(),
  onlyUnread: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

export const MailSearchSchema = MailQuerySchema.extend({
  q: z.string().min(1),
});
