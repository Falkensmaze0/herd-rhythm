import { NextRequest, NextResponse } from "next/server";

import { getMailService } from "@/lib/mail/factory";
import { MailQuerySchema } from "@/lib/mail/validators";
import { requireSessionUser } from "@/lib/server-auth";

const mailService = getMailService();

export async function GET(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const url = new URL(request.url);
    const parsed = MailQuerySchema.parse(Object.fromEntries(url.searchParams));
    const folders = parsed.folders?.length ? parsed.folders : parsed.folder ? [parsed.folder] : undefined;
    const messages = await mailService.listMessages(user.id, {
      folders,
      sort: parsed.sort,
      tags: parsed.tags,
      onlyUnread: parsed.onlyUnread,
    });
    return NextResponse.json({ data: messages, error: null });
  } catch (error) {
    console.error("[mail] inbox fetch failed", error);
    return NextResponse.json({ data: [], error: "Unable to load inbox" }, { status: 500 });
  }
}
