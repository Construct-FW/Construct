const { login, userData, changePassword, userInformationUpdate, profilePhotoUpdate, enable2fa, enable2faConfirm, disable2fa, googleRecoveryCodes, login2fa, roleList, updateRole } = require("./handler")
const { loginSchema, userDataSchema, changePasswordSchema, userInformationUpdateSchema, profilePhotoSchema, enable2faSchema, enable2faConfirmSchema, disable2faSchema, googleRecoveryCodesSchema, login2faSchema, roleListSchema, updateRoleSchema } = require("./validation")
const { authControl } = require('../../../../construct/middlewares/admin/authControl')
const { permissionControl } = require('../../../../construct/middlewares/admin/permissionControl')
const withoutRoutes = [
    '*',
    '/documentation', 
    '/documentation/uiConfig', 
    '/documentation/initOAuth', 
    '/documentation/json', 
    '/documentation/yaml', 
    '/documentation/static/*', 
    '/documentation/*', 
    '',
    '/public/',
    '/public/*'
]

module.exports = async (fastify, opts, next) => {

    fastify.route({
        method: 'POST',
        url: '/login',
        handler: await login,
        schema: loginSchema
    })

    fastify.route({
        method: 'POST',
        url: '/login2fa',
        handler: await login2fa,
        preHandler: await authControl,
        schema: login2faSchema
    })

    fastify.route({
        method: 'GET',
        url: '/data',
        handler: await userData,
        preHandler: await authControl,
        schema: userDataSchema
    })

    fastify.route({
        method: 'POST',
        url: '/changePassword',
        handler: await changePassword,
        preHandler: await authControl,
        schema: changePasswordSchema
    })

    fastify.route({
        method: 'POST',
        url: '/update',
        handler: await userInformationUpdate,
        preHandler: await authControl,
        schema: userInformationUpdateSchema
    })

    fastify.route({
        method: 'POST',
        url: '/profilePhoto',
        handler: await profilePhotoUpdate,
        preHandler: await authControl,
        schema: profilePhotoSchema
    })

    fastify.route({
        method: 'GET',
        url: '/enable2fa',
        handler: await enable2fa,
        preHandler: await authControl,
        schema: enable2faSchema
    })

    fastify.route({
        method: 'POST',
        url: '/enable2faConfirm',
        handler: await enable2faConfirm,
        preHandler: await authControl,
        schema: enable2faConfirmSchema
    })

    fastify.route({
        method: 'GET',
        url: '/disable2fa',
        handler: await disable2fa,
        preHandler: await authControl,
        schema: disable2faSchema
    })

    fastify.route({
        method: 'GET',
        url: '/googleRecoveryCodes',
        handler: await googleRecoveryCodes,
        preHandler: await authControl,
        schema: googleRecoveryCodesSchema
    })

    fastify.route({
        method: 'GET',
        url: '/roles',
        handler: await roleList,
        preHandler: async (request, reply) => {
            await authControl(request, reply)
            // await permissionControl(request, reply, 'roles')
            request.routes = [...fastify.routes.keys()].filter(n => !withoutRoutes.includes(n)).reduce((o,n) => {
                o.push(n.replaceAll("/v1/api/", ''))
                return o
            },[])
        },
        schema: roleListSchema
    })
    
    fastify.route({
        method: 'POST',
        url: '/updateRoles',
        handler: await updateRole,
        preHandler: async (request, reply) => {
            await authControl(request, reply)
            // await permissionControl(request, reply, 'roles')
        },
        schema: updateRoleSchema
    })

}