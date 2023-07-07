const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Setting",
    tableName: "settings",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        key: {
            type: "varchar",
            size: 150,
            unique: true
        },
        value: {
            type: "longtext"
        },
        options: {
            type: "longtext",
            nullable: true,
            default: null
        },
        value_type: {
            type: "tinyint"
        },
        status: {
            type: "tinyint",
            default: 0
        },
        created_at: {
            type: "timestamp",
            default: "CURRENT_TIMESTAMP"
        },
        updated_at: {
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
        }
    }
})