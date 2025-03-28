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
    userId: {
      type: "uuid",
    },
    appId: {
      type: "uuid",
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
});
