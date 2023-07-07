const swagger = require('construct').swagger

const listSchema = {
    tags: ['TableNameTitle'],
    summary: 'List TableNameTitle',
    query: {
        type: 'object',
        required: ['offset', 'limit'],
        properties: {
            offset: { type: 'number', minimum: 0, nullable: false, default: 0 },
            limit: { type: 'number', minimum: 5, max:250, nullable: false, default: 10 },
            orderField: { type: 'string', enum: ['id', 'name'], minimum: 1, nullable: true, default: 'name' },
            orderType: { type: 'string', enum: ['ASC', 'DESC'], nullable: true, default: 'ASC' },
            search: { type: 'string', minLength: 2, nullable: true }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const showSchema = {
    tags: ['TableNameTitle'],
    summary: 'Show TableNameTitle',
    headers: swagger.swagger.headers,
    params: swagger.swagger.params,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}


const addSchema = {
    tags: ['TableNameTitle'],
    summary: 'Add TableNameTitle',
    body: {
        type: 'object',
        required: ['name'],
        properties: {
            name: { type: 'string', minLength: 2, nullable: false }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const editSchema = {
    tags: ['TableNameTitle'],
    summary: 'Edit TableNameTitle',
    body: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 2, nullable: false }
        }
    },
    headers: swagger.swagger.headers,
    params: swagger.swagger.params,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const deleteSchema = {
    summary: 'Delete TableNameTitle',
    tags: ['TableNameTitle'],
    headers: swagger.swagger.headers,
    params: swagger.swagger.params,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

module.exports = {
    listSchema,
    showSchema,
    addSchema,
    editSchema,
    deleteSchema
}