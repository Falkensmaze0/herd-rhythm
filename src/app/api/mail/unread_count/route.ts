import { NextResponse } from "next/server";

import { getMailService } from "@/lib/mail/factory";
import { requireSessionUser } from "@/lib/server-auth";

const mailService = getMailService();

export async function GET() {
  try {
    const user = await requireSessionUser();
    const counts = await mailService.unreadCount(user.id);
    return NextResponse.json({ data: counts, error: null });
  } catch (error) {
    console.error("[mail] unread count failed", error);
    return NextResponse.json({ data: { total: 0, priority: 0 }, error: "Unable to load counts" }, { status: 500 });
  }
}
