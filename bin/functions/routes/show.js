fastify.route({
    method: 'GET',
    url: '/UrlName:id',
    handler: await FunctionName,
    schema: FunctionNameSchema
})