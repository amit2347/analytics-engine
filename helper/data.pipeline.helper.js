const { AppDataSource } = require("../config/db");
const ApplicationData = require("../entities/ApplicationData");
const { processEventLogsForUser } = require("../helper/data.pipeline.helper");

const Event = require("../entities/Event");
const eventRepository = AppDataSource.getRepository(Event);
module.exports.processEventLogs = async (logs) => {
  try {
    const masterMap = new Map();
    let dataToSaveInDB = [];
    // First, process logs and aggregate data
    for (let i = 0; i < logs.length; i += 1) {
      let log = JSON.parse(logs[i]);
      const epochTime = log.timeStamp;
      const date = new Date(epochTime);

      // Ensure we have all required fields
      if (!log.event || !log.appId) {
        continue;
      }

      const dateSplit = date.toISOString().split("T");
      const dateKey = dateSplit[0]; // YYYY-MM-DD format

      // Ensure the event exists in the masterMap
      if (!masterMap.has(log.event)) {
        masterMap.set(log.event, {});
      }

      const eventMap = masterMap.get(log.event);

      // Ensure the appId exists for this event
      if (!eventMap[log.appId]) {
        eventMap[log.appId] = {};
      }

      const appIdMap = eventMap[log.appId];

      // Initialize date entry if it doesn't exist
      if (!appIdMap[dateKey]) {
        appIdMap[dateKey] = {
          totalCount: 0,
          uniqueUsers: new Set(),
        };
      }

      // Update counters
      const dateEntry = appIdMap[dateKey];
      dateEntry.totalCount += 1;

      // Track unique users
      if (log.userId) {
        dateEntry.uniqueUsers.add(log.metadata.userId);
      }
      const appDetails = await AppDataSource.getRepository(
        ApplicationData
      ).findOne({
        where: {
          id: log.appId,
        },
      });
      let dataObj = AppDataSource.getRepository(Event).create({
        event: log.event,
        referrer: log.referrer,
        device: log.device,
        ipAddress: log.ipAddress,
        metadata: log.metadata,
        timestamp: new Date(log.timeStamp),
        appId: appDetails,
      });
      dataToSaveInDB.push(dataObj);
    }

    await eventRepository.save(dataToSaveInDB);

    // Generate rows for event summary table
    const eventSummaryRows = [];

    for (const [event, appIdMap] of masterMap.entries()) {
      for (const [appId, dateMap] of Object.entries(appIdMap)) {
        for (const [date, entry] of Object.entries(dateMap)) {
          // Create row for event summary table
          const row = {
            event_name: event,
            app_id: appId,
            event_date: date,
            total_count: entry.totalCount,
            unique_users_count: entry.uniqueUsers.size, // Only the count
            created_at: new Date().toISOString(), // Current timestamp
            updated_at: new Date().toISOString(),
          };

          eventSummaryRows.push(row);
        }
      }
    }

    return eventSummaryRows;
  } catch (e) {
    console.error(e);
  }
};
module.exports.processEventLogsForUser = async (logs) => {
  const userStatsMap = new Map();

  for (let i = 0; i < logs.length; i += 1) {
    let log = JSON.parse(logs[i]);

    // Ensure we have required fields
    if (!log.userId) {
      continue;
    }

    const userId = log.userId;

    // Initialize user entry if it doesn't exist
    if (!userStatsMap.has(userId)) {
      userStatsMap.set(userId, {
        userId: userId,
        totalEvents: 0,
        deviceDetails: {},
        ipAddress: log.ipAddress || "Unknown",
        lastEventTimestamp: new Date(log.timeStamp),
      });
    }

    const userEntry = userStatsMap.get(userId);

    // Update total events
    userEntry.totalEvents += 1;

    // Update device details
    const deviceType = log.device;
    if (deviceType) {
      userEntry.deviceDetails[deviceType] =
        (userEntry.deviceDetails[deviceType] || 0) + 1;
    }

    // Update last event timestamp
    const currentEventTime = new Date(log.timeStamp);
    if (currentEventTime > userEntry.lastEventTimestamp) {
      userEntry.lastEventTimestamp = currentEventTime;
    }
  }

  // Convert Map to array of user stats
  const userStatsRows = [];

  for (const [userId, stats] of userStatsMap.entries()) {
    userStatsRows.push({
      userId: stats.userId,
      totalEvents: stats.totalEvents,
      deviceDetails: stats.deviceDetails,
      ipAddress: stats.ipAddress,
      lastEventTimestamp: stats.lastEventTimestamp,
    });
  }

  return userStatsRows;
};
