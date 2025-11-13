import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getMailService } from "@/lib/mail/factory";
import { requireSessionUser } from "@/lib/server-auth";

const mailService = getMailService();

const TagSchema = z.object({
  tags: z.array(z.string().min(1)).default([]),
});

interface RouteContext {
  params: { id: string };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const payload = TagSchema.parse(await request.json());
    const updated = await mailService.updateTags(user.id, context.params.id, payload.tags);
    if (!updated) {
      return NextResponse.json({ data: null, error: "Message not found" }, { status: 404 });
    }
    return NextResponse.json({ data: updated, error: null });
  } catch (error) {
    console.error("[mail] tag update failed", error);
    return NextResponse.json({ data: null, error: "Unable to update tags" }, { status: 500 });
  }
}
