fastify.route({
    method: 'DELETE',
    url: '/:id',
    handler: await FunctionName,
    schema: FunctionNameSchema
})