import Redis from "ioredis";

import { REDIS_URL } from "@/lib/mail/constants";

let publisher: Redis | null = null;

const createClient = () =>
  new Redis(REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
  });

export const getRedisPublisher = () => {
  if (!publisher) {
    publisher = createClient();
    publisher.on("error", (error) => {
      console.error("[redis] publisher error", error);
    });
  }
  return publisher;
};

export const createRedisSubscriber = () => {
  const subscriber = createClient();
  subscriber.on("error", (error) => {
    console.error("[redis] subscriber error", error);
  });
  return subscriber;
};
