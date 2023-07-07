const swagger = require('../../../../construct/base/lib/swagger')

const loginSchema = {
    tags: ['Auth'],
    summary: 'Do login with username or email',
    body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: { type: 'string', nullable: false },
            password: { type: 'string', nullable: false },
            remember: { type: 'number', minLength: 1 }
        }
    }
}

const login2faSchema = {
    tags: ['Auth'],
    summary: 'Login Confirm With Google two factor authentation',
    body: {
        type: 'object',
        reqired: ['code'],
        properties: {
            code: { type: 'string', nullable: false, minLength: 6, maxLength: 6 }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const userDataSchema = {
    tags: ['Auth'],
    summary: 'Get user informations data',
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const changePasswordSchema = {
    tags: ['Auth'],
    summary: 'Change your password with token',
    body: {
        type: 'object',
        required: ['currentPassword', 'newPassword', 'newPasswordAgain'],
        properties: {
            currentPassword: { type: 'string', nullable: false, minLength: 6 },
            newPassword: { type: 'string', nullable: false, minLength: 6 },
            newPasswordAgain: { type: 'string', nullable: false, minLength: 6 }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const userInformationUpdateSchema = {
    tags: ['Auth'],
    summary: 'Update your profile informations',
    body: {
        required: ['first_name', 'last_name', 'birthdate', 'email_address', 'phone_number'],
        type: 'object',
        properties: {
            first_name: { type: 'string', nullable: false, minLength: 2 },
            last_name: { type: 'string', nullable: false, minLength: 2 },
            birthdate: { type: 'string', nullable: false, minLength: 10, maxLength: 10 },
            email_address: { type: 'string', format:'email', nullable: false, minLength: 4 },
            phone_number: { type: 'string', nullable: false, minLength: 0 }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const profilePhotoSchema = {
    tags: ['Auth'],
    summary: 'Upload Profile Photo',
    consumes: ['multipart/form-data'],
    body: {
        type: 'object',
        required: ['photo'],
        properties: {
            photo: {
                type: 'object'
            }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const googleRecoveryCodesSchema = {
    tags: ['Google2fa'],
    summary: 'Google two factor authentication - Recovery Codes - It is for recovery',
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const enable2faSchema = {
    tags: ['Google2fa'],
    summary: 'Enable Google two factor authentication',
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const disable2faSchema = {
    tags: ['Google2fa'],
    summary: 'Disable Google two factor authentication',
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const enable2faConfirmSchema = {
    tags: ['Google2fa'],
    summary: 'Confirm Google two factor authentation',
    body: {
        type: 'object',
        reqired: ['code'],
        properties: {
            code: { type: 'string', nullable: false, minLength: 6, maxLength: 6 }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const roleListSchema = {
    tags: ['Auth'],
    summary: 'Roles for admin permissions',
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const updateRoleSchema = {
    tags: ['Auth'],
    summary: 'Update roles for admin permissions',
    body: {
        type: 'object',
        required: ['roles', 'admin_id'],
        properties: {
            roles: { type: 'array', nullable: false, items: { type: 'string' } },
            admin_id: { type: 'string', nullable: false }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

module.exports = {
    loginSchema,
    login2faSchema,
    userDataSchema,
    changePasswordSchema,
    userInformationUpdateSchema,
    profilePhotoSchema,
    enable2faSchema,
    disable2faSchema,
    enable2faConfirmSchema,
    googleRecoveryCodesSchema,
    roleListSchema,
    updateRoleSchema
}