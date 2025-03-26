const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "UserAnalytics",
  tableName: "user_analytics",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    userId: {
      type: "varchar",
    },
    totalEvents: {
      type: "int",
    },
    deviceDetails: {
      type: "json",
    },
    ipAddress: {
      type: "varchar",
    },
    lastEventTimestamp: {
      type: "timestamp",
      createDate: true,
    },
  },
});
