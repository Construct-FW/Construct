const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "ModuleName",
    tableName: "TableName",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
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