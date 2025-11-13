import { NextResponse } from "next/server";

import { getMailService } from "@/lib/mail/factory";
import { requireSessionUser } from "@/lib/server-auth";

const mailService = getMailService();

interface RouteContext {
  params: { id: string };
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const message = await mailService.getMessage(user.id, context.params.id);
    if (!message) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: message, error: null });
  } catch (error) {
    console.error("[mail] fetch message failed", error);
    return NextResponse.json({ data: null, error: "Unable to load message" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    await mailService.deleteMessage(user.id, context.params.id);
    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (error) {
    console.error("[mail] delete message failed", error);
    return NextResponse.json({ data: null, error: "Unable to delete" }, { status: 500 });
  }
}
