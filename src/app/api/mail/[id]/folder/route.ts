import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getMailService } from "@/lib/mail/factory";
import { requireSessionUser } from "@/lib/server-auth";
import { MailFolder } from "@/types/mail";

const mailService = getMailService();

const FolderSchema = z.object({
  folder: z.enum(["inbox", "sent", "archived", "trash"]),
});

interface RouteContext {
  params: { id: string };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const payload = FolderSchema.parse(await request.json());
    const updated = await mailService.updateFolder(user.id, context.params.id, payload.folder as MailFolder);
    if (!updated) {
      return NextResponse.json({ data: null, error: "Message not found" }, { status: 404 });
    }
    return NextResponse.json({ data: updated, error: null });
  } catch (error) {
    console.error("[mail] folder update failed", error);
    return NextResponse.json({ data: null, error: "Unable to update folder" }, { status: 500 });
  }
}
