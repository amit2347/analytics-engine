const { Worker } = require("bullmq");
const { createClient } = require("redis");
const { Promise } = require("bluebird");
const {processEventLogs} = require('../helper/data.pipeline.helper')
// ✅ Create Redis client for direct Redis operations
const redisClient = createClient({
  socket: {
    host: "localhost",
    port: 6379,
  },
});

// ✅ Ensure Redis client connects before usage
(async () => {
  await redisClient.connect();
  console.log("🚀 Connected to Redis!");
})();

// ✅ Create a BullMQ Worker with its own Redis connection
const worker = new Worker(
  "process-logs",
  async (job) => {
    console.log("hit")
    const { batchSize } = job.data;

    const logs = await redisClient.lRange("logs", 0, batchSize - 1);
    // {
    //     event: 'Login_Button_Clicked',
    //     referrer: 'google.com',
    //     device: 'Andoird',
    //     ipAddress: '255.555.2321.213',
    //     metadata: {
    //       browser: 'Chrome',
    //       os: 'Android',
    //       screenSize: '1080x1920',
    //       userId: 'a2f712a1-3251-4d03-8ebb-055a6b8c1d6b'
    //     },
    //     appId: 1
    //     timeStamp : 1743093696314
    //   }
    if (logs.length > 0) {
        await redisClient.lTrim("logs", batchSize, -1);
        console.log(` Processed ${logs.length} logs.`);
      } else {
        console.log("⚠️ No logs to process.");
      }
    const resFromPipeline = await processEventLogs(logs)
    console.log("res",resFromPipeline)
   
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
    autorun: true, // Ensure worker starts automatically
    concurrency: 1, // Process one job at a time
  }
);

// ✅ Event Listeners for Debugging
// worker.on("completed", (job) => {
//   console.log(`🎉 Job ${job.id} completed successfully!`);
// });

// worker.on("failed", (job, err) => {
//   console.error(`❌ Job ${job.id} failed:`, err);
// });
