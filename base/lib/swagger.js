const { entityFiles } = require('./typeorm')
const config = require('../../../../app/config');

// const callTags = async () => {
//     const entities = await entityFiles();
//     const tags = Object.values(entities.files).reduce((o,n) => {
//         o.push({ name: titleCase(n.options.tableName) })
//         return o
//     }, [])
    
//     return tags
// }

const titleCase = (str = '') => {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
    }
    return str.join(' ');
}

const openAdmin = process.argv[2] && process.argv[2] === 'admin' ? true : false;

const conf = {
    routePrefix: '/documentation',
    swagger: {
        info: {
            title: openAdmin ? 'ADMIN' : 'API',
            description: '---',
            contact: {
                email: config.siteInfo.email
            },
            version: '1.0'
        },
        host: config.isDevelopment ? config.host + ':' + (openAdmin ? config.ports.admin : config.ports.api) : config.domain,
        schemes: config.isDevelopment ? ['http'] : ['https'],
        //tags: callTags(),
        consumes: ['application/json'],
        produces: ['application/json'],
        definitions: {},
        securityDefinitions: {
            token: {
                name: 'token',
                in: 'header',
                type: 'apiKey',
                description: 'Token for authontication format JWT'
            }
        },
        headers: {
            type: 'object',
                properties: {
                lang: { type: 'string', minLength: 2, maxLength: 4, default: 'en', nullable: false }
            }
        },
        params: {
            type: 'object',
            required: ['id'],
            properties: {
                id: { type: 'number', minimum: 1, nullable: false }
            }
        }
    },
    uiHooks: {
        onRequest: function (request, reply, next) { next() },
        preHandler: function (request, reply, next) { next() }
    },
    exposeRoute: true,
    uiConfig: {
        docExpansion: 'none', // none|list|full expand
        deepLinking: true
    }
};

conf.addParams = (objectData = {}) => {

    const objectNew = JSON.parse(JSON.stringify(conf.swagger.params));
    objectNew.properties[objectData.field] = objectData;

    return objectNew;
}

module.exports = conf;