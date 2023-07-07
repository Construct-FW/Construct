const FunctionNameSchema = {
    tags: ['TableNameTitle'],
    headers: swagger.swagger.headers,
    params: swagger.swagger.params,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}