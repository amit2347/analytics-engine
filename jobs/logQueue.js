const { Queue } = require("bullmq");
const IORedis = require("ioredis");
const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT) || 6379,
});

const logQueue = new Queue("process-logs", { connection: redisConnection });

let lastProcessedTime = Date.now(); // Track last processing time

async function checkAndEnqueue() {
  console.log("running");
  const logCount = await redisConnection.llen("logs");

  // If logs are above threshold (500), process immediately
  if (logCount > 500) {
    console.log(`Queueing job for ${logCount} logs`);
    await logQueue.add("process-logs", { batchSize: logCount });
    lastProcessedTime = Date.now(); // Update last processed time
  }
  // If logs are stuck for > 60 sec, process whatever is available
  else if (logCount > 0 && Date.now() - lastProcessedTime >= 60000) {
    console.log(`Timeout reached, processing ${logCount} logs`);
    await logQueue.add("process-logs", { batchSize: logCount });
    lastProcessedTime = Date.now(); // Reset timer
  }
}

// Run every 20 seconds
setInterval(checkAndEnqueue, 20000);
