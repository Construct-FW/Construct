const swagger = require('../../../../construct/base/lib/swagger')

const loginSchema = {
    tags: ['Auth'],
    summary: 'Do login with username or email',
    body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: { type: 'string', nullable: false },
            password: { type: 'string', nullable: false }
        }
    }
}

const registerSchema = {
    tags: ['Auth'],
    summary: 'Register new user',
    body : {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties : {
            email : { type: 'string', format: 'email', nullable: false },
            username : { type : 'string', nullable: false, minLength: 4, maxLength: 32 },
            password : { type: 'string', nullable: false, minLength: 8 },
        }
    }
}

const activationSchema = {
    tags: ['Auth'],
    summary: 'Do activation with verify email',
    body : {
        type: 'object',
        required: ['code'],
        properties : {
            code : { type : 'string', nullable: false, minLength: 6, maxLength: 6 }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const resetPasswordSchema = {
    tags: ['Auth'],
    summary: 'Reset your password from forgot password email',
    body: {
        type: 'object',
        required: ['hash', 'userid', 'newPassword', 'confirmPassword'],
        properties: {
            userid: { type: 'string', nullable: false, minimum: 1 },
            hash: { type: 'string', nullable: false, minLength: 3 },
            newPassword: { type: 'string', nullable: false, minLength: 8 },
            confirmPassword: { type: 'string', nullable: false, minLength: 8 }
        }
    }
}

const changePasswordSchema = {
    tags: ['Auth'],
    summary: 'Change your password with token',
    body: {
        type: 'object',
        required: ['currentPassword', 'newPassword', 'newPasswordAgain'],
        properties: {
            currentPassword: { type: 'string', nullable: false, minLength: 8 },
            newPassword: { type: 'string', nullable: false, minLength: 8 },
            newPasswordAgain: { type: 'string', nullable: false, minLength: 8 }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const forgotPasswordSchema = {
    tags: ['Auth'],
    summary: 'Send email for change password',
    body: {
        type: 'object',
        required: ['username'],
        properties: {
            username: { type: 'string', nullable: false, minLength: 4, maxLength: 32 }
        }
    }
}

const socialOauthSchema = {
    tags: ['X-HIDDEN'],
    summary: 'Social callback url for login'
}

module.exports = {
    loginSchema,
    registerSchema,
    activationSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    socialOauthSchema
}