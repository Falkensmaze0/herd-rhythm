import { NextRequest } from "next/server";

import { createRedisSubscriber } from "@/lib/mail/redis";
import { requireSessionUser } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await requireSessionUser();
  const subscriber = createRedisSubscriber();
  const channel = `user:${user.id}`;
  await subscriber.subscribe(channel);

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
      };

      subscriber.on("message", (_, message) => {
        try {
          send(JSON.parse(message));
        } catch (error) {
          console.error("[mail] SSE payload parse failed", error);
        }
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(`event: ping\ndata: ${Date.now()}\n\n`);
      }, 25000);

      request.signal.addEventListener("abort", async () => {
        clearInterval(heartbeat);
        await subscriber.unsubscribe(channel);
        subscriber.disconnect();
        controller.close();
      });
    },
    cancel: async () => {
      await subscriber.unsubscribe(channel);
      subscriber.disconnect();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-store",
    },
  });
}
