const { list, edit } = require('./handler')
const { listSchema, editSchema } = require('./validation')

module.exports = async (fastify, opts, next) => {

    fastify.route({
        method: 'GET',
        url: '/',
        handler: await list,
        schema: listSchema
    })

    fastify.route({
        method: 'POST',
        url: '/edit',
        handler: await edit,
        schema: editSchema
    })

}