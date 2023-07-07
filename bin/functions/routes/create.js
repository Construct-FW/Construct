fastify.route({
    method: 'POST',
    url: '/',
    handler: await FunctionName,
    schema: FunctionNameSchema
})