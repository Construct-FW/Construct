const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Admin",
    tableName: "admins",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        username: {
            type: "varchar",
            length: 75,
            unique: true
        },
        email_address: {
            type: "varchar",
            length: 75,
            unique: true
        },
        password: {
            type: "varchar"
        },
        avatar: {
            type: "varchar",
            nullable: true,
            default: null
        },
        first_name: {
            type: "varchar",
            length: 50,
            nullable: true
        },
        last_name: {
            type: "varchar",
            length: 50,
            nullable: true
        },
        phone_number: {
            type: "varchar",
            length: 50,
            nullable: true
        },
        birthdate: {
            type: "date",
            nullable: true
        },
        token: {
            type: "varchar",
            nullable: true
        },
        status: {
            type: "boolean",
            default: false
        },
        granded: {
            type: "boolean",
            default: false
        },
        created_at: {
            type: "timestamp",
            default: "CURRENT_TIMESTAMP"
        },
        updated_at: {
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP"
        }
    }
})