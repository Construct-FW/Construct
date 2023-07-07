const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "User",
    tableName: "users",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        username: {
            type: "varchar",
            length: 32,
            unique: true
        },
        email_address: {
            type: "varchar",
            length: 75,
            unique: true,
            nullable: false
        },
        password: {
            type: "varchar"
        },
        phone_number: {
            type: "varchar",
            length: 50,
            nullable: true
        },
        status: {
            type: "tinyint",
            default: 0
        },
        activation_code: {
            type: "varchar",
            length: 16,
            default: null
        },
        phone_verify: {
            type: "boolean",
            default: false
        },
        email_verify: {
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
        },
        deleted_at: {
            type: "timestamp",
            nullable: true,
            default: null
        }
    },
    relations: {
        profile: {
            target: "UserProfile",
            type: "one-to-one",
            joinColumn: {
                name: "id",
                referencedColumnName: 'user_id'
            }
        }
    }
})