import { NextRequest, NextResponse } from "next/server";

import { getMailService } from "@/lib/mail/factory";
import { MailSearchSchema } from "@/lib/mail/validators";
import { requireSessionUser } from "@/lib/server-auth";

const mailService = getMailService();

export async function GET(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = MailSearchSchema.parse(params);
    const folders = parsed.folders?.length ? parsed.folders : parsed.folder ? [parsed.folder] : undefined;
    const result = await mailService.search(user.id, parsed.q, {
      folders,
    });
    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    console.error("[mail] search failed", error);
    return NextResponse.json({ data: { primary: [], secondary: [] }, error: "Unable to search" }, { status: 500 });
  }
}
