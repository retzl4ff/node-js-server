import dotenv from "dotenv";

import redis from "redis";
import { RedisStore } from "connect-redis";


const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379
  }
});

redisClient.connect().catch(console.error);

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "My app:",
});

export { redisClient, redisStore };