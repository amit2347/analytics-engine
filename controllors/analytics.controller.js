const { AppDataSource } = require("../config/db");
const ApplicationData = require("../entities/applicationData");
const Event = require("../entities/Event");
const User = require("../entities/User");

const eventRepository = AppDataSource.getRepository(Event);
const applicationDataRepository = AppDataSource.getRepository(ApplicationData);
const userRepository = AppDataSource.getRepository(User);
module.exports.collectLogs = async (req, res) => {
  try {
    const payload = req.body;
    const appData = await applicationDataRepository.findOne({
      where: {
        id: payload.appId,
      },
    });
    const objectToSave = eventRepository.create({
      event: payload.event,
      referrer: payload.referrer ? payload.referrer : null,
      device: payload.device,
      ipAddress: payload.ipAddress,
      metadata: payload.metadata,
      appId: appData,
    });
    await eventRepository.save(objectToSave);
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
    const { event, startDate, endDate, app_id } = req.query;

    if (!event) {
      return res.status(400).json({ message: "Event type is required" });
    }

    const queryBuilder = eventRepository
      .createQueryBuilder("event")
      .select([
        "subquery.event AS event",
        "SUM(subquery.count) AS count",
        "SUM(subquery.uniqueUsers) AS uniqueUsers",
        "JSON_OBJECTAGG(subquery.device, subquery.count) AS deviceData",
      ])
      .innerJoin(
        (qb) =>
          qb
            .select([
              "event.device AS device",
              "COUNT(*) AS count",
              "COUNT(DISTINCT event.ipAddress) AS uniqueUsers",
              "event.event AS event",
            ])
            .from(Event, "event")
            .where("event.event = :event", { event })
            .groupBy("event.device, event.event, event.appId"),
        "subquery",
        "subquery.event = event.event"
      )
      .groupBy("subquery.event");

    // Apply optional filters
    if (startDate) {
      queryBuilder.andWhere("event.timestamp >= :startDate", { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere("event.timestamp <= :endDate", { endDate });
    }
    if (app_id) {
      queryBuilder.andWhere("event.appId = :app_id", { app_id });
    }

    // Execute Query
    const result = await queryBuilder.execute();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching event summary:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getUserStats = async (req, res) => {
  try {
    const userId = req.query.userId;
    const userExistence = await userRepository.findOne({
      where: {
        id: userId,
      },
    });
    console.log("userExistence" , userExistence)
    if (!userExistence) {
      return res.status(404).send({
        message: "user not found",
      });
    }
    const queryBuilder = eventRepository
      .createQueryBuilder("event")
      .select([
        "event.ipAddress AS ipAddress",
        "event.metadata->>'$.browser' AS browser", // Extract browser from JSON metadata
        "event.metadata->>'$.os' AS os", // Extract OS from JSON metadata
        "COUNT(*) AS totalEvents",
      ])
      .where("event.metadata->>'$.userId' = :userId", {userId: userExistence.id })
      .groupBy("event.ipAddress, browser, os")
      .orderBy("MAX(event.timestamp)", "DESC") // Get the most recent event details
      .limit(1); // Fetch the latest event for user details

    // Execute Query
    const result = await queryBuilder.getRawOne();
      console.log("restl" , result)
    // Format the response
    const response = {
      userId : userExistence.id,
      totalEvents: result?.totalEvents || 0,
      deviceDetails: {
        browser: result?.browser || "Unknown",
        os: result?.os || "Unknown",
      },
      ipAddress: result?.ipAddress || "Unknown",
    };

    return res.json(response);
  } catch (e) {
    console.error(e);
    return res.status(400).send({
      message: "something went wrong",
    });
  }
};
