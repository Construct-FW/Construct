const swagger = require('../../../../construct/base/lib/swagger')

const userDataSchema = {
    tags: ['Users'],
    summary: 'Get user informations data',
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id : { type: 'string', default: 'me', nullable: false }
        }
    }
}

const deleteUserSchema = {
    tags: ['Users'],
    summary: 'Delete user with :id',
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id : { type: 'string', default: 'me', nullable: false }
        }
    }
}

const userInformationUpdateSchema = {
    tags: ['Users'],
    summary: 'Update your profile informations',
    body: {
        type: 'object',
        properties: {
            first_name: { type: 'string', nullable: false, minLength: 2 },
            last_name: { type: 'string', nullable: false, minLength: 2 },
            birthdate: { type: 'string', nullable: false, minLength: 6 },
            gender : { type : 'string', enum:['male','female', 'not_specified'], nullable: true }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id : { type: 'string', default: 'me', nullable: false }
        }
    }
}

const userUpdatePhoneNumberSchema = {
    tags: ['Users'],
    summary: 'Update phone number',
    body: {
        type: 'object',
        required: ['phone_number'],
        properties: {
            phone_number : { type : 'string', nullable: true, minLength: 6 }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id : { type: 'string', default: 'me', nullable: false }
        }
    }
}

const verifyPhoneNumberSchema = {
    tags: ['Users'],
    summary: 'Update phone number',
    body: {
        type: 'object',
        required: ['phone_number', 'code'],
        properties: {
            phone_number : { type : 'string', nullable: true, minLength: 6 },
            code : { type : 'string', nullable: true, minLength: 6 }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id : { type: 'string', default: 'me', nullable: false }
        }
    }
}

const profilePhotoSchema = {
    tags: ['Users'],
    summary: 'Upload Profile Photo',
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        required: ['photo'],
        properties: {
            photo : {
                type: 'object'
            }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id : { type: 'string', default: 'me', nullable: false }
        }
    }
}

const getProfileSchema = {
    tags: ['Users'],
    summary: 'User profile with :id',
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id : { type: 'string', default: 'me', nullable: false }
        }
    }
}

const getUserSettingSchema = {
    tags: ['Users'],
    summary: 'User settings with :id',
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id : { type: 'string', default: 'me', nullable: false }
        }
    }
}

module.exports = {
    userDataSchema,
    userInformationUpdateSchema,
    userUpdatePhoneNumberSchema,
    verifyPhoneNumberSchema,
    profilePhotoSchema,
    deleteUserSchema,
    getProfileSchema,
    getUserSettingSchema
}