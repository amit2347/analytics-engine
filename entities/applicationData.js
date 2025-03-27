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
        hashedApiKey: {
            type: "varchar",
            length: 64,
            unique: true,
            nullable: false
        },
        createdAt: {
            type: "timestamp",
            createDate: true
        },
        revokeStatus:{
            type : "boolean",
            default : false
        }
    },
    relations: {
        ownerUser: {
            target: "User", // Reference to the "User" entity
            type: "many-to-one", // Many Applications can belong to one User
            joinColumn: {
                name: "ownerUser" // Matches the column name
            },
            onDelete: "CASCADE" // Cascades delete when the referenced user is deleted
        }
    }
});
