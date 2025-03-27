const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    googleId: {
      type: "varchar",
      unique: true,
    },
    email: {
      type: "varchar",
      unique: true,
    },
    name: {
      type: "varchar",
    },
    appId:{
        type: "varchar",
        unique: true,
        nullable : true
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
  },
});
