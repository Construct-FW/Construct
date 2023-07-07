const Ajv = require('ajv');
const registerRoutes = require('../utils/registerRoutes')
const oauthPlugin = require('@fastify/oauth2');
const config = require('../../../../app/config');
const path = require('path');
const i18n = require('./i18n');

const opts = {
    attachFieldsToBody: true,
    sharedSchemaId: '#uploadSchema',
    limits: {
        fieldNameSize: 100, // Max field name size in bytes
        fieldSize: 100,     // Max field value size in bytes
        fields: 50,         // Max number of non-file fields
        fileSize: 1000000,  // For multipart forms, the max file size in bytes
        files: 5,           // Max number of file fields
        headerPairs: 2000   // Max number of header key=>value pairs
    }
}

function init(openAdmin, fastify, prefix, swaggerConf, serviceConfig) {
    let routes = [];
    const ajv = new Ajv({
        removeAdditional: false,
        coerceTypes: false,
        allErrors: true
    })

    fastify.schemaCompiler = schema =>  ajv.compile(schema)

    fastify.register(require('@fastify/routes'))
    fastify.register(require('@fastify/cors'), {})
    fastify.register(require('@fastify/multipart'), opts)

    fastify.addHook('onRoute', options => {
        routes.push({
            METHOD: options.method,
            URL: options.url
            // HANDLER: options.handler.constructor.name
        });
    });

    if (swaggerConf) {
        if(!config.isDevelopment) {
            swaggerConf.swagger.host = 'api.' + config.domain + '/v1/' + serviceConfig.name;
        }
        fastify.register(require('@fastify/swagger'), swaggerConf);
    }

    // fastify.register(registerRoutes(openAdmin), { prefix });
    fastify.register(registerRoutes(openAdmin));
    
    if (config.oauths.facebook.status && serviceConfig.port == config.ports.api) {
        fastify.register(oauthPlugin, {
            name: 'facebookOAuth2',
            credentials: {
                client: {
                    id: config.oauths.facebook.client_id,
                    secret: config.oauths.facebook.client_secret
                },
                auth: oauthPlugin.FACEBOOK_CONFIGURATION
            },
            // register a fastify url to start the redirect flow
            startRedirectPath: config.oauths.facebook.startRedirectPath,
            // facebook redirect here after the user login
            callbackUri: config.oauths.facebook.callbackUrl,
            tags: ['SocialLogin']
        })
    }

    if (config.oauths.google.status && serviceConfig.port == config.ports.api) {
        fastify.register(oauthPlugin, {
            name: 'googleOAuth2',
            scope: config.oauths.google.scope,
            credentials: {
                client: {
                    id: config.oauths.google.client_id,
                    secret: config.oauths.google.client_secret,
                },
                auth: oauthPlugin.GOOGLE_CONFIGURATION,
            },
            startRedirectPath: config.oauths.google.startRedirectPath,
            callbackUri: config.oauths.google.callbackUrl,
            callbackUriParams: {
                // custom query param that will be passed to callbackUri
                // access_type: 'offline', // will tell Google to send a refreshToken too
            },
            tags: ['SocialLogin']
        })
    }

    if (config.oauths.github.status && serviceConfig.port == config.ports.api) {
        fastify.register(oauthPlugin, {
            name: 'githubOAuth2',
            scope: config.oauths.github.scope,
            credentials: {
                client: {
                    id: config.oauths.github.client_id,
                    secret: config.oauths.github.client_secret,
                },
                auth: oauthPlugin.GITHUB_CONFIGURATION,
            },
            startRedirectPath: config.oauths.github.startRedirectPath,
            callbackUri: config.oauths.github.callbackUrl,
            tags: ['SocialLogin']
        })
    }

    if (config.oauths.spotify.status && serviceConfig.port == config.ports.api) {
        fastify.register(oauthPlugin, {
            name: 'spotifyOAuth2',
            scope: config.oauths.spotify.scope,
            credentials: {
                client: {
                    id: config.oauths.spotify.client_id,
                    secret: config.oauths.spotify.client_secret,
                },
                auth: oauthPlugin.SPOTIFY_CONFIGURATION,
            },
            startRedirectPath: config.oauths.spotify.startRedirectPath,
            callbackUri: config.oauths.spotify.callbackUrl,
            tags: ['SocialLogin']
        })
    }

    if (config.oauths.linkedin.status && serviceConfig.port == config.ports.api) {
        fastify.register(oauthPlugin, {
            name: 'linkedinOAuth2',
            scope: config.oauths.linkedin.scope,
            credentials: {
                client: {
                    id: config.oauths.linkedin.client_id,
                    secret: config.oauths.linkedin.client_secret,
                },
                auth: oauthPlugin.LINKEDIN_CONFIGURATION,
                options: {
                    authorizationMethod: 'body'
                }
            },
            startRedirectPath: config.oauths.linkedin.startRedirectPath,
            callbackUri: config.oauths.linkedin.callbackUrl,
            tags: ['SocialLogin']
        })
    }

    fastify.register(require('@fastify/static'), {
        root: path.join(process.cwd(), '/public'),
        prefix: '/public/'
    })

    fastify.setErrorHandler(function (error, request, reply) {
        // Send error response
        if (error.validation) {

            let messages = []
            
            if(Array.isArray(error.validation)) {
                messages = error.validation.reduce((o,n) => {
                    let message = { type: n.keyword, key: null, params: {} }
                    if(n.dataPath && n.dataPath.length > 0) {
                        message.key = n.dataPath.replace(new RegExp('/', 'g'), '').replace(/\./g, '-').replace(/\[/g, '-').replace(/\]/g, '-')
                    }

                    if(n.params) {
                        if(Object.keys(n.params).length > 0) {
                            for (let pk = 0; pk < Object.keys(n.params).length; pk++) {
                                const paramKey = Object.keys(n.params)[pk];
                                const paramValue = n.params[paramKey];
                                
                                if(paramKey == 'additionalProperty') {
                                    message.key = paramValue.replace(new RegExp('/', 'g'), '').replace(/\./g, '-').replace(/\[/g, '-').replace(/\]/g, '-')
                                    n.params[paramKey] = i18n.__(message.key)
                                } else if(paramKey == 'missingProperty') {
                                    message.key = paramValue.replace(new RegExp('/', 'g'), '').replace(/\./g, '-').replace(/\[/g, '-').replace(/\]/g, '-')
                                    n.params[paramKey] = i18n.__(message.key)
                                }
                            }
                        }
                        message.params = n.params;
                    }

                    if(typeof message.key == 'string' && message.key.length > 0) {
                        message.key = i18n.__(message.key)
                    }

                    o.push(message)
                    return o
                }, [])

                messages = messages.reduce((o,n) => {
                    o.push(i18n.__('validations.' + n.type, { field: n.key, ...n.params }))
                    return o
                }, [])
            }

            reply.status(200).send({ status: false, data: [], meta: null, messages })
        } else {
            if(config.isDevelopment) {
                console.log(error);
            }
            
            const messages = []

            if(typeof error === 'string') {
                messages.push(error)
            }

            if(error.data) {
                messages.push(error.data.payload)
            }

            if(error.sqlMessage && config.isDevelopment) {
                messages.push(error.sqlMessage)
            }

            if(error.code && error.code != 'ER_DUP_ENTRY') {
                messages.push('item_already_exists')
            } else if(error.code && error.code == 'ER_ROW_IS_REFERENCED_2') {
                messages.push('item_using_in_other_table')
            } else {
                messages.push('something_went_wrong')
                console.log(error.code);
            }

            reply.status(200).send({ status: false, data:[], meta: null, messages })
        }
    })

    return routes;
}

function startServer(openAdmin, fastify, config, swaggerConf) {
    let prefix = `${config.prefix || 'api'}/v${config.version || 1}`
    let routes = init(openAdmin, fastify, prefix, swaggerConf, config);
    return new Promise((resolve, reject) => {
        fastify.listen({
            port: config.port,
            host: config.host
        })
            .then(address => {
                console.table(routes);
                console.info(`${config.name} Service started on ${address}`);
                resolve(true)
            })
            .catch(e => {
                console.log(e);
                console.table({
                    time: new Date().toUTCString(),
                    message: e.message
                });
                reject(e)
                process.exit(1);
            });
    })
}

function startFastify(openAdmin, serviceConfig, swaggerConf) {
    let opts = {
        ajv: {
            customOptions: {
                jsonPointers: true,
                allErrors: true
            },
        }
    }

    if (serviceConfig.logLevel !== 'nolog') {
        const logFile = `${__dirname}/../logs/${serviceConfig.name}-2fastify.log`
        opts.logger = {
            level: serviceConfig.logLevel,
            file: logFile
        }
    }

    const fastify = require('fastify')(opts);

    startServer(openAdmin, fastify, serviceConfig, swaggerConf).then(n => {
        console.log('FASTIFY STARTED')
    })

    return fastify;
}

module.exports = startFastify;