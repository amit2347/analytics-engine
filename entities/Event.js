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
    event: {
      type: "varchar",
    },
    referrer: {
      type: "varchar",
      nullable: true,
      default: null,
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
    timestamp: {
      type: "timestamp",
      createDate: true,
      index: true,
    },
  },
  relations: {
    appId: {
        target: "ApplicationData", // Reference to the "User" entity
        type: "many-to-one", // Many Applications can belong to one User
        joinColumn: {
            name: "appid" // Matches the column name
        },
        onDelete: "CASCADE" // Cascades delete when the referenced user is deleted
    }
}
});
