module.exports = {
    fastify: require('./base/lib/fastify'),
    jwt: require('./base/lib/jwt'),
    bcrypt: require('./base/lib/bcrypt'),
    aws: require('./base/lib/aws'),
    controls: require('./base/lib/controls'),
    creator: require('./base/lib/creator'),
    image: require('./base/lib/image'),
    mailer: require('./base/lib/nodemailer'),
    slug: require('./base/lib/slug'),
    swagger: require('./base/lib/swagger'),
    typeorm: require('./base/lib/typeorm'),
    upload: require('./base/lib/upload'),
    maps: require('./base/lib/maps'),
    i18n: require('./base/lib/i18n'),
    response: require('./base/utils/responses'),
    middlewares: {
        admin: {
            auth: require('./middlewares/admin/authControl'),
            permission: require('./middlewares/admin/permissionControl')
        },
        api: {
            auth: require('./middlewares/api/authControl')
        }
    }
}