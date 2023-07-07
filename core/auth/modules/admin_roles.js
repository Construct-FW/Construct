const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "AdminRole",
    tableName: "admin_roles",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        admin_id: {
            type: "int"
        },
        role_page: {
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
        admins: {
            target: "Admin",
            type: "many-to-one",
            joinColumn: {
                name: "admin_id",
                referencedColumnName: 'id'
            }
        }
    }
})