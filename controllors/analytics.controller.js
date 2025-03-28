const { AppDataSource } = require("../config/db");
const redisClient = require("../config/redis");

const EventSummary = require("../entities/EventSummary");

const UserAnalytics = require("../entities/UserAnalytics");

module.exports.collectLogs = async (req, res) => {
  try {
    const { appId, userId } = req.userContext;
    const payload = req.body;
    console.log("userId", userId);
    const objToPushToRedis = {
      event: payload.event,
      referrer: payload.referrer ? payload.referrer : null,
      device: payload.device,
      ipAddress: payload.ipAddress,
      metadata: payload.metadata,
      appId,
      timeStamp: Date.now(),
      userId: userId,
    };
    await redisClient.lpush("logs", JSON.stringify(objToPushToRedis));
    return res.status(200).send({
      message: "Logged",
    });
  } catch (e) {
    console.error(e);
    return res.status(400).send({
      message: "Something went wrong",
    });
  }
};

module.exports.getEventSummary = async (req, res) => {
  try {
    const { event: eventName, startDate, endDate, app_id: appId } = req.query;

    // Validate required parameters
    if (!eventName) {
      return res.status(400).json({ message: "Event type is required" });
    }

    // Create query builder
    const queryBuilder = AppDataSource.getRepository(EventSummary)
      .createQueryBuilder("eventSummary")
      .where("eventSummary.eventName = :eventName", { eventName });

    // Add app_id condition if provided
    if (appId) {
      queryBuilder.andWhere("eventSummary.appId = :appId", {
        appId: parseInt(appId, 10),
      });
    }

    // Add date range if provided
    if (startDate && endDate) {
      queryBuilder.andWhere(
        "eventSummary.date BETWEEN :startDate AND :endDate",
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        }
      );
    }

    // Perform SQL-level aggregation
    const result = await queryBuilder
      .select("SUM(eventSummary.totalCount)", "totalEvents")
      .addSelect("SUM(eventSummary.uniqueUsers)", "totalUniqueUsers")
      .getRawOne();

    const summary = {
      event: eventName,
      totalEvents: Number(result.totalEvents) || 0,
      totalUniqueUsers: Number(result.totalUniqueUsers) || 0,
    };

    return res.status(200).json(summary);
  } catch (error) {
    console.error("Error fetching event summary:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports.getUserStats = async (req, res) => {
  try {
    const userId = req.query.userId;

    // Fetch user stats directly from UserAnalytics table
    const userStats = await AppDataSource.getRepository(UserAnalytics).findOne({
      where: {
        userId,
      },
    });

    // If no stats found for the user
    if (!userStats) {
      return res.status(404).send({
        message: "User stats not found",
      });
    }

    // Format the response
    const response = {
      userId: userStats.userId,
      totalEvents: userStats.totalEvents || 0,
      lastEventTimestamp: userStats.lastEventTimestamp,
      deviceDetails: userStats.deviceDetails || {
        browser: "Unknown",
        os: "Unknown",
      },
      ipAddress: userStats.ipAddress || "Unknown",
    };

    return res.json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).send({
      message: "Internal server error",
      error: e.message,
    });
  }
};
