const swagger = require('../../../base/lib/swagger')

const listSchema = {
    tags: ['Settings'],
    query: {
        type: 'object',
        required: ['offset', 'limit'],
        properties: {
            offset: { type: 'number', minimum: 0, nullable: false, default: 0 },
            limit: { type: 'number', minimum: 5, max:250, nullable: false, default: 50 },
            orderField: { type: 'string', enum: ['id', 'key'], minimum: 1, nullable: true, default: 'key' },
            orderType: { type: 'string', enum: ['ASC', 'DESC'], nullable: true, default: 'ASC' },
            search: { type: 'string', minLength: 2, nullable: true }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

module.exports = {
    listSchema
}