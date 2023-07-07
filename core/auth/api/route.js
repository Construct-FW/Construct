const { login, register, activation, changePassword, resetPassword, forgotPassword, googleCallback, githubCallback, facebookCallback, spotifyCallback, linkedinCallback } = require("./handler")
const { loginSchema, registerSchema, activationSchema, changePasswordSchema, resetPasswordSchema, forgotPasswordSchema, socialOauthSchema } = require("./validation")
const { authControl } = require('../../../middlewares/api/authControl')
const config = require("../../../../../app/config")

module.exports = async (fastify, opts, next) => {
    
    fastify.route({
        method: 'POST',
        url: '/login',
        handler: await login,
        schema: loginSchema
    })

    fastify.route({
        method: 'POST',
        url: '/register',
        handler: await register,
        schema: registerSchema
    })

    fastify.route({
        method: 'PUT',
        url: '/activation',
        handler: await activation,
        preHandler: authControl,
        schema: activationSchema
    })

    fastify.route({
        method: 'PUT',
        url: '/forgot_password',
        handler: await forgotPassword,
        schema: forgotPasswordSchema
    })

    fastify.route({
        method: 'PUT',
        url: '/reset_password',
        handler: await resetPassword,
        schema: resetPasswordSchema
    })

    fastify.route({
        method: 'PUT',
        url: '/change_password',
        handler: await changePassword,
        preHandler: authControl,
        schema: changePasswordSchema
    })

    if (config.oauths.google.status) {
        fastify.route({
            method: 'GET',
            url: '/googleCallback',
            handler: async (req, res) => {
                await googleCallback(req, res, fastify)
            },
            schema: socialOauthSchema
        })
    }

    if (config.oauths.github.status) {
        fastify.route({
            method: 'GET',
            url: '/githubCallback',
            handler: async (req, res) => {
                await githubCallback(req, res, fastify)
            },
            schema: socialOauthSchema
        })
    }

    if (config.oauths.facebook.status) {
        fastify.route({
            method: 'GET',
            url: '/facebookCallback',
            handler: async (req, res) => {
                await facebookCallback(req, res, fastify)
            },
            schema: socialOauthSchema
        })
    }

    if (config.oauths.spotify.status) {
        fastify.route({
            method: 'GET',
            url: '/spotifyCallback',
            handler: async (req, res) => {
                await spotifyCallback(req, res, fastify)
            },
            schema: socialOauthSchema
        })
    }

    if (config.oauths.linkedin.status) {
        fastify.route({
            method: 'GET',
            url: '/linkedinCallback',
            handler: async (req, res) => {
                await linkedinCallback(req, res, fastify)
            },
            schema: socialOauthSchema
        })
    }

}