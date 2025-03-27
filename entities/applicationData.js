const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "ApplicationData",
    tableName: "application_data",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        appName: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        appUrl: {
            type: "varchar",
            length: 255,
            unique: true,
            nullable: false
        },
        ownerEmail: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        apiKey: {
            type: "varchar",
            length: 64,
            unique: true,
            nullable: false
        },
        createdAt: {
            type: "timestamp",
            createDate: true
        }
    }
});
