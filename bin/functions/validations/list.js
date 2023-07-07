const FunctionNameSchema = {
    tags: ['TableNameTitle'],
    query: {
        type: 'object',
        required: ['offset', 'limit'],
        properties: {
            offset: { type: 'number', minimum: 0, nullable: false, default: 0 },
            limit: { type: 'number', minimum: 5, max:250, nullable: false, default: 10 },
            orderField: { type: 'string', enum: ['id', 'created_at', 'updated_at'sortable_fields], minimum: 1, nullable: true, default: 'id' },
            orderType: { type: 'string', enum: ['ASC', 'DESC'], nullable: true, default: 'ASC' },
            search: { type: 'string', minLength: 2, nullable: true }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}