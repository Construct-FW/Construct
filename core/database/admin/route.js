const { tables, fields, createModule, modules, moduleShow } = require('./handler')
const { tableSchema, fieldSchema, createModuleSchema, modulesSchema, moduleShowSchema } = require('./validation')

module.exports = async (fastify, opts, next) => {

    fastify.route({
        method: 'GET',
        url: '/tables',
        handler: await tables,
        schema: tableSchema
    })

    fastify.route({
        method: 'GET',
        url: '/fields',
        handler: await fields,
        schema: fieldSchema
    })

    fastify.route({
        method: 'POST',
        url: '/module/create',
        handler: await createModule,
        schema: createModuleSchema
    })

    fastify.route({
        method: 'GET',
        url: '/module/show/:id',
        handler: await moduleShow,
        schema: moduleShowSchema
    })

    fastify.route({
        method: 'GET',
        url: '/module/list',
        handler: await modules,
        schema: modulesSchema
    })

}