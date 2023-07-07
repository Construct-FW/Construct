const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "UserSettings",
    tableName: "user_settings",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        user_id: {
            type: "int"
        },
        skey: {
            type: "varchar"
        },
        svalue: {
            type: "varchar"
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
    },
    relations: {
        users: {
            target: "User",
            type: "one-to-one",
            joinColumn: {
                name: "user_id",
                referencedColumnName: 'id'
            }
        }
    },
    indices: [
        {
            name: "user_settings_user_id_skey",
            unique: true,
            columns: [
                "user_id",
                "skey"
            ]
        }
    ]
})