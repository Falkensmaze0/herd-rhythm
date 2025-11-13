import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getMailService } from "@/lib/mail/factory";
import { requireSessionUser } from "@/lib/server-auth";

const mailService = getMailService();

const ToggleSchema = z.object({
  isRead: z.boolean(),
});

interface RouteContext {
  params: { id: string };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const payload = ToggleSchema.parse(await request.json());
    const message = await mailService.markRead(user.id, context.params.id, payload.isRead);
    return NextResponse.json({ data: message, error: null });
  } catch (error) {
    console.error("[mail] toggle read failed", error);
    return NextResponse.json({ data: null, error: "Unable to update message" }, { status: 500 });
  }
}
