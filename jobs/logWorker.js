const { Worker } = require("bullmq");
const { createClient } = require("redis");
const { Promise } = require("bluebird");
const {
  processEventLogs,
  processEventLogsForUser,
} = require("../helper/data.pipeline.helper");
const { AppDataSource } = require("../config/db");
const EventSummary = require("../entities/EventSummary");
const UserAnalytics = require("../entities/UserAnalytics");
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
    console.log("hit");
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
    const resFromPipeline = await processEventLogs(logs);
    const resFromUserPipeline = await processEventLogsForUser(logs);
    console.log(resFromUserPipeline, "resFromUserPipeline");
    await Promise.map(resFromUserPipeline, async (item) => {
      try {
        const existence = await AppDataSource.getRepository(
          UserAnalytics
        ).findOne({
          where: {
            userId: item.userId,
          },
        });
        if (existence) {
          await AppDataSource.getRepository(UserAnalytics).update(
            { id: existence.id },
            {
              totalEvents: existence.totalEvents + item.totalEvents,
              lastEventTimestamp: item.lastEventTimestamp,
            }
          );
        } else {
          const objectToSave = AppDataSource.getRepository(
            UserAnalytics
          ).create({
            userId: item.userId,
            totalEvents: item.totalEvents,
            deviceDetails: item.deviceDetails,
            ipAddress: item.ipAddress,
            lastEventTimestamp: item.lastEventTimestamp,
          });
          const res = await AppDataSource.getRepository(UserAnalytics).save(
            objectToSave
          );
          console.log("res ->", res);
        }
      } catch (e) {
        console.error(e);
        return;
      }
    });
    await Promise.map(resFromPipeline, async (item) => {
      const existence = await AppDataSource.getRepository(EventSummary).findOne(
        {
          where: {
            appId: item.app_id,
            eventName: item.event_name,
            date: item.event_date,
          },
        }
      );
      if (existence) {
        await AppDataSource.getRepository(EventSummary).update(
          { id: existence.id },
          {
            totalCount: existence.totalCount + item.total_count,
            uniqueUsers: existence.uniqueUsers + item.unique_users_count,
          }
        );
      } else {
        const objectToSave = AppDataSource.getRepository(EventSummary).create({
          appId: item.app_id,
          eventName: item.event_name,
          date: item.event_date,
          totalCount: item.total_count,
          uniqueUsers: item.unique_users_count,
        });
        await AppDataSource.getRepository(EventSummary).save(objectToSave);
      }
    });
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
