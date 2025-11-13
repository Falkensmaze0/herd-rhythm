import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { getMailService } from "@/lib/mail/factory";
import { MailSendSchema } from "@/lib/mail/validators";
import { requireSessionUser } from "@/lib/server-auth";

const mailService = getMailService();

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const payload = MailSendSchema.parse(await request.json());
    const result = await mailService.sendMail(user.id, payload);
    return NextResponse.json({ data: { mode: result.mode }, error: null });
  } catch (error) {
    console.error("[mail] send failed", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ data: null, error: "Invalid payload" }, { status: 422 });
    }
    return NextResponse.json({ data: null, error: "Failed to send message" }, { status: 500 });
  }
}
