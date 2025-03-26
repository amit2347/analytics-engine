const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Event",
  tableName: "events",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    eventName: {
      type: "varchar",
    },
    url: {
      type: "varchar",
    },
    referrer: {
      type: "varchar",
      nullable: true,
    },
    device: {
      type: "varchar",
    },
    ipAddress: {
      type: "varchar",
    },
    metadata: {
      type: "json",
    },
    appId: {
      type: "uuid",
    },
    timestamp: {
      type: "timestamp",
      createDate: true,
    },
  },
});
