fastify.route({
    method: 'PUT',
    url: '/UrlName:id',
    handler: await FunctionName,
    schema: FunctionNameSchema
})