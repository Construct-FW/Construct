const swagger = require('../../../base/lib/swagger')

const listSchema = {
    tags: ['Admins'],
    query: {
        type: 'object',
        required: ['offset', 'limit'],
        properties: {
            offset: { type: 'number', minimum: 0, nullable: false, default: 0 },
            limit: { type: 'number', minimum: 5, max:250, nullable: false, default: 10 },
            orderField: { type: 'string', enum: ['admin.id'], minimum: 1, nullable: true, default: 'admin.id' },
            orderType: { type: 'string', enum: ['ASC', 'DESC'], nullable: true, default: 'ASC' },
            search: { type: 'string', minLength: 2, nullable: true }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const showSchema = {
    tags: ['Admins'],
    headers: swagger.swagger.headers,
    params: swagger.swagger.params,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}


const addSchema = {
    tags: ['Admins'],
    body: {
        type: 'object',
        required: ['username', 'email_address', 'password', 'first_name', 'last_name', 'birthdate', 'status', 'phone_number'],
        properties: {
            username: { type: 'string', minLength: 2, nullable: false },
            email_address: { type: 'string', minLength:3, nullable: false },
            first_name: { type: 'string', minLength:3, nullable: false },
            last_name: { type: 'string', minLength:3, nullable: false },
            password: { type: 'string', minLength:8, nullable: false },
            phone_number: { type: 'string', minLength:3, nullable: false },
            birthdate: { type: 'string', minLength:10, nullable: false },
            status: { type: 'boolean', nullable: false }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const editSchema = {
    tags: ['Admins'],
    body: {
        type: 'object',
        properties: {
            first_name: { type: 'string', minLength:3, nullable: false },
            last_name: { type: 'string', minLength:3, nullable: false },
            password: { type: 'string', minLength:8, nullable: false },
            phone_number: { type: 'string', minLength:3, nullable: false },
            birthdate: { type: 'string', minLength:10, nullable: false },
            status: { type: 'boolean', nullable: false }
        }
    },
    headers: swagger.swagger.headers,
    params: swagger.swagger.params,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

module.exports = {
    listSchema,
    showSchema,
    addSchema,
    editSchema
}