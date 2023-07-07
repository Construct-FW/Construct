const { list } = require('./handler')
const { listSchema } = require('./validation')

module.exports = async (fastify, opts, next) => {

    fastify.route({
        method: 'GET',
        url: '/',
        handler: await list,
        schema: listSchema
    })

}