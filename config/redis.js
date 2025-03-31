const Redis = require("ioredis");
require("dotenv").config();

try {
  const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redisClient.on("connect", () => {
    console.log("Connected to Redis");
  });

  redisClient.on("ready", () => {
    console.log("Redis client is ready");
  });

  redisClient.on("error", (err) => {
    console.error("Redis connection error:", err);
  });

  redisClient.on("close", () => {
    console.log("Redis connection closed");
  });
  module.exports = redisClient;
} catch (e) {
  console.error("error from redis config", e);
}
