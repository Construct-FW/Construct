fastify.route({
    method: 'GET',
    url: '/FunctionName',
    handler: await FunctionName,
    schema: FunctionNameSchema
})