const { Worker } = require("bullmq");
const redisClient = require("../config/redis");
const { Promise } = require("bluebird");
const {
  processEventLogs,
  processEventLogsForUser,
} = require("../helper/data.pipeline.helper");
const { AppDataSource } = require("../config/db");
const EventSummary = require("../entities/EventSummary");
const UserAnalytics = require("../entities/UserAnalytics");

// ✅ Create a BullMQ Worker with its own Redis connection
const worker = new Worker(
  "process-logs",
  async (job) => {
    try {
      const { batchSize } = job.data;
      const logs = await redisClient.lrange("logs", 0, batchSize - 1);

      if (logs.length > 0) {
        await redisClient.ltrim("logs", batchSize, -1);
        console.log(`✅ Processed ${logs.length} logs.`);
      } else {
        console.log("⚠️ No logs to process.");
        return;
      }

      // Processing logs
      try {
        const resFromPipeline = await processEventLogs(logs);
        console.log("✅ Processed event logs:", resFromPipeline);

        const resFromUserPipeline = await processEventLogsForUser(logs);

        await Promise.map(resFromUserPipeline, async (item) => {
          try {
            const userRepo = AppDataSource.getRepository(UserAnalytics);
            const existence = await userRepo.findOne({
              where: { userId: item.userId },
            });

            if (existence) {
              await userRepo.update(
                { id: existence.id },
                {
                  totalEvents: existence.totalEvents + item.totalEvents,
                  lastEventTimestamp: item.lastEventTimestamp,
                }
              );
            } else {
              const objectToSave = userRepo.create(item);
              await userRepo.save(objectToSave);
            }
          } catch (e) {
            console.error("❌ Error processing user analytics:", e);
          }
        });

        await Promise.map(resFromPipeline, async (item) => {
          try {
            const eventRepo = AppDataSource.getRepository(EventSummary);
            const existence = await eventRepo.findOne({
              where: {
                appId: item.app_id,
                eventName: item.event_name,
                date: item.event_date,
              },
            });

            if (existence) {
              await eventRepo.update(
                { id: existence.id },
                {
                  totalCount: existence.totalCount + item.total_count,
                  uniqueUsers: existence.uniqueUsers + item.unique_users_count,
                }
              );
            } else {
              const objectToSave = eventRepo.create(item);
              await eventRepo.save(objectToSave);
            }
          } catch (e) {
            console.error("❌ Error processing event summary:", e);
          }
        });
      } catch (e) {
        console.error("❌ Error in pipeline processing:", e);
      }
    } catch (e) {
      console.error("❌ Job processing error:", e);
    }
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

// Catch worker-level errors
worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed with error:`, err);
});

worker.on("error", (err) => {
  console.error("❌ Worker encountered an error:", err);
});
