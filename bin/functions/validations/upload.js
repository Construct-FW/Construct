const FunctionNameSchema = {
    tags: ['TableNameTitle'],
    body: {
        type: 'object',required_fields
        properties: {
            file : { type: 'string', format: 'binary' },
            field_list_properties
        }
    },
    headers: swagger.swagger.headers,
    params: swagger.swagger.params,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}