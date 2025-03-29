const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "ApiKey",
  tableName: "api_keys",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    jti: {
      type: "varchar",
      length: 255,
      unique: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    user: {
      type: "many-to-one", // Many API keys belong to one user
      target: "User", // The User entity
      joinColumn: { name: "userId" }, // Maps userId as FK
      onDelete: "CASCADE", // Optional: Delete API keys if the user is deleted
    },
    application: {
      type: "many-to-one", // Many API keys belong to one application
      target: "ApplicationData", // The Application entity
      joinColumn: { name: "appId" }, // Maps appId as FK
      onDelete: "CASCADE", // Optional: Delete API keys if the app is deleted
    },
  },
});
