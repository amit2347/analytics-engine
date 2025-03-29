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
    totalEvents: {
      type: "int",
      nullable: false,
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
  relations: {
    user: {
      type: "many-to-one", // Many user analytics records belong to one user
      target: "User", // Refers to the User entity
      joinColumn: { name: "userId" }, // Maps userId as FK
      onDelete: "CASCADE", // Optional: Deletes analytics if the user is deleted
    },
  },
});
