const { OkResponse, ErrorResponse, ErrorResponseJson } = require('construct/base/utils/responses');
const { phoneValidation } = require('construct/base/lib/controls')
const config = require('../../../../../app/config');
const { uploadFile, deleteFile } = require('construct/base/lib/upload');

const { datastore } = require('construct/base/lib/typeorm')
const User = datastore.store.getRepository('User')
const UserProfile = datastore.store.getRepository('UserProfile')
const UserSetting = datastore.store.getRepository('UserSetting')

const userData = async (request, reply) => {

    const { user } = request

    delete user.profile

    OkResponse({
        data : deleteFields(user)
    }, reply)
}

const userInformationUpdate = async (request, reply) => {

    const { first_name, last_name, gender, birthdate } = request.body
    const { user } = request
    
    if(first_name) {
        user.profile.first_name = first_name
    }

    if(last_name) {
        user.profile.last_name = last_name
    }

    if(birthdate) {
        user.profile.birthdate = birthdate
    }

    if(gender) {
        user.profile.gender = gender
    }

    UserProfile.save(user.profile)

    return OkResponse({
        messages: "user_information_update_ok"
    }, reply)
}

const deleteUser = async (request, reply) => {

    const { user } = request

    user.status = 0
    user.deleted_at = new Date()
    await User.save(user)

    return OkResponse({
        messages: "user_delete_ok"
    }, reply)
}

const profilePhotoUpdate = async (request, reply) => {

    const { user } = request
    const { photo } = request.body

    const letUploadFile = await uploadFile(photo, user.username, 'profile', [{
        width: 500,
        height:500
    }])
    
    if(letUploadFile.status) {

        if(user.profile.avatar && user.profile.avatar != '' && user.profile.avatar != null) {
            await deleteFile(user.profile.avatar)
        }

        user.profile.avatar = letUploadFile.files[0].fileUrl
        await UserProfile.save(user.profile)

        return OkResponse({
            status: true,
            data: deleteFields(user)
        }, reply)

    } else {
        return ErrorResponseJson(letUploadFile, reply)
    }
}

const userUpdatePhoneNumber = async (request, reply) => {

    const { user } = request
    const { phone_number } = request.body

    if (phone_number) {

        if(phoneValidation(phone_number)) {

            const phoneUniqueControl = await User.createQueryBuilder('user').where({ phone_number: phone_number }).getOne()

            if (!phoneUniqueControl || user.phone_number == phone_number) {

                if(user.phone_number != phone_number) {
                    user.phone_verify = 0
                }

                user.phone_number = phone_number

                User.save(user)
                
            } else {
                return ErrorResponse("phone_already_exists", reply)
            }

        } else {
            return ErrorResponse("wrong_phone_format", reply)
        }

    }

    return OkResponse({
        messages: "user_phone_update_ok"
    }, reply)
}

const verifyPhoneNumber = async (request, reply) => {

    const { user } = request
    const { phone_number, code } = request.body

    if (phone_number && code) {

        if(phoneValidation(phone_number)) {

            const phoneUniqueControl = await User.createQueryBuilder('user').where({ phone_number: phone_number }).getOne()

            if (!phoneUniqueControl || user.phone_number == phone_number) {

                if(user.phone_number != phone_number) {
                    user.phone_verify = 0
                }

                user.phone_number = phone_number

                User.save(user)

            } else {
                return ErrorResponse("phone_already_exists", reply)
            }

        } else {
            return ErrorResponse("wrong_phone_format", reply)
        }

    }

    return OkResponse({
        messages: "user_phone_update_ok"
    }, reply)
}

const getProfile = async (request, reply) => {

    const { user } = request

    return OkResponse({
        data: deleteFields(user).profile
    }, reply)
}

const getUserSettings = async (request, reply) => {

    const { user } = request

    const settings = UserSetting.find({ user_id: user.id }).getMany()

    return OkResponse({
        data: settings
    }, reply)
}

const deleteFields = (user = {}) => {

    delete user.password
    delete user.activation_code
    delete user.status
    delete user.created_at
    delete user.updated_at
    delete user.deleted_at

    if(user.profile) {
        user.profile.avatar = user.profile.avatar && user.profile.avatar != null ? config.cdn + user.profile.avatar : null
    }
    
    return user
}

module.exports = {
    userData,
    userInformationUpdate,
    profilePhotoUpdate,
    userUpdatePhoneNumber,
    verifyPhoneNumber,
    deleteUser,
    getProfile,
    getUserSettings
}