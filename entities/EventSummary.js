const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "EventSummary",
  tableName: "event_summary",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    eventName: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    date: {
      type: "date",
      nullable: false,
    },
    totalCount: {
      type: "bigint",
      nullable: false,
    },
    uniqueUsers: {
      type: "bigint",
      nullable: false,
    },
    deviceData: {
      type: "json",
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    lastUpdatedAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    application: {
      type: "many-to-one",
      target: "ApplicationData",
      joinColumn: { name: "appId" },
      onDelete: "CASCADE",
    },
  },
  indices: [
    {
      name: "idx_event_summary_app_event_date",
      columns: ["application", "eventName", "date"],
    },
  ],
  uniques: [
    {
      name: "unique_app_event_date",
      columns: ["application", "eventName", "date"],
    },
  ],
});
