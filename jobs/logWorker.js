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
const ApplicationData = require("../entities/ApplicationData");
const User = require("../entities/User");

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
            const UserAnalyticsRepo =
              AppDataSource.getRepository(UserAnalytics);
            const existence = await UserAnalyticsRepo.findOne({
              where: { user: { id: item.userId } }, // ✅ Correct way to filter by userId
              relations: ["user"], // 👈 Ensure TypeORM loads the relation
            });
            if (existence) {
              await UserAnalyticsRepo.update(
                { id: existence.id },
                {
                  totalEvents: existence.totalEvents + item.totalEvents,
                  lastEventTimestamp: item.lastEventTimestamp,
                }
              );
            } else {
              const userDetails = await AppDataSource.getRepository(
                User
              ).findOne({
                where: {
                  id: item.userId,
                },
              });
              const objectToSave = UserAnalyticsRepo.create({
                totalEvents: item.totalEvents,
                deviceDetails: item.deviceDetails,
                ipAddress: item.ipAddress,
                lastEventTimestamp: item.lastEventTimestamp,
                user: userDetails,
              });
              await UserAnalyticsRepo.save(objectToSave);
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
                application: { id: item.app_id },
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
              const applicationDetails = await AppDataSource.getRepository(
                ApplicationData
              ).findOne({
                where: {
                  id: item.app_id,
                },
              });
              const objectToSave = eventRepo.create({
                eventName: item.event_name,
                date: item.event_date,
                totalCount: item.total_count,
                uniqueUsers: item.unique_users_count,
                deviceData: {},
                application: applicationDetails,
              });
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
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
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
