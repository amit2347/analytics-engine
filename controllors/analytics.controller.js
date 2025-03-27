const { AppDataSource } = require("../config/db");
const ApplicationData = require("../entities/applicationData");
const Event = require("../entities/Event");

const eventRepository = AppDataSource.getRepository(Event);
const applicationDataRepository = AppDataSource.getRepository(ApplicationData);
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
      ).groupBy("subquery.event");

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
