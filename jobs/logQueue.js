const { Queue } = require("bullmq");
const redisClient = require("../config/redis");
const logQueue = new Queue("process-logs");

let lastProcessedTime = Date.now(); // Track last processing time

async function checkAndEnqueue() {
  console.log("running");
  const logCount = await redisClient.llen("logs");

  // If logs are above threshold (5000), process immediately
  if (logCount > 0) {
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

// Run every 5 seconds
setInterval(checkAndEnqueue, 10000);
