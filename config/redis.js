const Redis = require("ioredis");
require("dotenv").config();
exports.connectToRedis = async () => {
  const redisClient = new Redis({
    host: process.env.REDIS_HOST, // Redis server host
    port: process.env.REDIS_PORT, // Redis server port
    password: process.env.REDIS_PASSWORD, // Redis password
  });

  try {
    await new Promise((resolve, reject) => {
      redisClient.on("connect", () => {
        console.log("Connected to Redis");
        resolve();
      });

      redisClient.on("ready", () => {
        console.log("Redis client is ready");
      });

      redisClient.on("error", (err) => {
        console.error("Redis connection error:", err);
        reject(err);
      });

      redisClient.on("close", () => {
        console.log("Redis connection closed");
      });
    });

    return redisClient; // Return the client for further use
  } catch (err) {
    console.error("Error initializing Redis connection:", err);
    throw err; // Re-throw the error for handling outside this function
  }
}
