const { userData, userInformationUpdate, profilePhotoUpdate, deleteUser, getProfile, userUpdatePhoneNumber, verifyPhoneNumber, getUserSettings } = require("./handler")
const { userDataSchema, userInformationUpdateSchema, profilePhotoSchema, deleteUserSchema, getProfileSchema, userUpdatePhoneNumberSchema, verifyPhoneNumberSchema, getUserSettingSchema } = require("./validation")
const { authControl } = require('../../../middlewares/api/authControl')

module.exports = async (fastify, opts, next) => {

    fastify.route({
        method: 'GET',
        url: '/:id',
        handler: await userData,
        preHandler: authControl,
        schema: userDataSchema
    })

    fastify.route({
        method: 'DELETE',
        url: '/:id',
        handler: await deleteUser,
        preHandler: authControl,
        schema: deleteUserSchema
    })

    fastify.route({
        method: 'PUT',
        url: '/:id/profile_photo',
        handler: await profilePhotoUpdate,
        preHandler: await authControl,
        schema: profilePhotoSchema
    })

    fastify.route({
        method: 'PUT',
        url: '/:id/phone_number',
        handler: await userUpdatePhoneNumber,
        preHandler: await authControl,
        schema: userUpdatePhoneNumberSchema
    })

    fastify.route({
        method: 'PATCH',
        url: '/:id/phone_number_verify',
        handler: await verifyPhoneNumber,
        preHandler: await authControl,
        schema: verifyPhoneNumberSchema
    })

    fastify.route({
        method: 'GET',
        url: '/:id/profile',
        handler: await getProfile,
        preHandler: authControl,
        schema: getProfileSchema
    })

    fastify.route({
        method: 'PUT',
        url: '/:id/profile',
        handler: await userInformationUpdate,
        preHandler: authControl,
        schema: userInformationUpdateSchema
    })
    
    fastify.route({
        method: 'GET',
        url: '/:id/settings',
        handler: await getUserSettings,
        preHandler: authControl,
        schema: getUserSettingSchema
    })

}