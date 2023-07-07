const { list, add, edit, show } = require('./handler')
const { listSchema, addSchema, showSchema, editSchema } = require('./validation')

module.exports = async (fastify, opts, next) => {

    fastify.route({
        method: 'GET',
        url: '/',
        handler: await list,
        schema: listSchema
    })

    fastify.route({
        method: 'POST',
        url: '/',
        handler: await add,
        schema: addSchema
    })

    fastify.route({
        method: 'GET',
        url: '/:id',
        handler: await show,
        schema: showSchema
    })

    fastify.route({
        method: 'PUT',
        url: '/:id',
        handler: await edit,
        schema: editSchema
    })

}