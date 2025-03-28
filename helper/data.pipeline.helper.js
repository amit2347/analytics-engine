module.exports.processEventLogs = async (logs) => {
  const masterMap = new Map();

  // First, process logs and aggregate data
  for (let i = 0; i < logs.length; i += 1) {
    let log = JSON.parse(logs[i]);
    const epochTime = log.timeStamp;
    const date = new Date(epochTime);
    
    // Ensure we have all required fields
    if (!log.event || !log.appId) {
      console.warn(`Skipping log due to missing event or appId:`, log);
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
    if (log.metadata?.userId) {
      dateEntry.uniqueUsers.add(log.metadata.userId);
    }
  }

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
          updated_at: new Date().toISOString()
        };

        eventSummaryRows.push(row);
      }
    }
  }

  return eventSummaryRows;
};