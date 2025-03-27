module.exports.processEventLogs = async (logs) => {
    const masterMap = new Map();
  
    for (let i = 0; i < logs.length; i += 1) {
      let log = JSON.parse(logs[i]);
      const epochTime = log.timeStamp;
      const date = new Date(epochTime);
      
      // Remove unnecessary await - split is synchronous

      console.log(date.toISOString())
      const dateSplit = date.toISOString().split("T");
      const dateKey = dateSplit[0]; // YYYY-MM-DD format
  
      // Ensure the event exists in the masterMap
      if (!masterMap.has(log.event)) {
        masterMap.set(log.event, {});
      }
  
      const eventMap = masterMap.get(log.event);
  
      // Initialize date entry if it doesn't exist
      if (!eventMap[dateKey]) {
        eventMap[dateKey] = {
          totalCount: 0,
          uniqueUsers: new Set(),
        };
      }
  
      // Update counters
      const dateEntry = eventMap[dateKey];
      dateEntry.totalCount += 1;
  
      // Track unique users
      if (log.metadata?.userId) {
        dateEntry.uniqueUsers.add(log.metadata.userId);
      }
  
    }
  
    // Convert Sets to array sizes for easier processing
    for (const [event, dateMap] of masterMap.entries()) {
      for (const [date, entry] of Object.entries(dateMap)) {
        entry.uniqueUsersCount = entry.uniqueUsers.size;
        entry.uniqueUsers = Array.from(entry.uniqueUsers);
      }
    }
  
    return masterMap;
  };