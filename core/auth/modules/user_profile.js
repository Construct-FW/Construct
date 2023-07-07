const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "UserProfile",
    tableName: "user_profiles",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        user_id: {
            type: "int",
            unique: true
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
        birthdate: {
            type: "date",
            nullable: true
        },
        gender: {
            type: "varchar",
            length: 10,
            nullable: true,
            default: null
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
    }
})