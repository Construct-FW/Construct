const { OkResponse, ErrorResponse, ErrorResponseJson } = require('../../../../construct/base/utils/responses.js');
const { signData } = require('../../../../construct/base/lib/jwt');
const { doHash, verifyHash } = require('../../../../construct/base/lib/bcrypt')
// const { getIpAddress } = require('../../../../construct/base/lib/controls')
const { datastore } = require('../../../../construct/base/lib/typeorm')
const Admin = datastore.store.getRepository('Admin')
const AdminGoogleVerifyCodes = datastore.store.getRepository('AdminGoogleVerifyCodes')
const AdminRole = datastore.store.getRepository('AdminRole')
const config = require('../../../../../app/config');
const { createRandomCodes } = require('../../../../construct/base/lib/creator')
const twofactor = require("node-2fa");
const { uploadFile, deleteFile } = require('../../../../construct/base/lib/upload.js');

const login = async (request, reply) => {

    const { username, password, remember } = request.body

    let findUser = await Admin.createQueryBuilder('admin')
        .where({ username })
        .orWhere({ email_address: username })
        .getOne()

    if (findUser) {

        const controlPassword = await verifyHash(password, findUser.password);

        if (controlPassword) {

            if (findUser.status == 1) {

                findUser.token = await signData({
                    id: findUser.id,
                    username: findUser.username,
                    google_2fa: false,
                    smsfactor: false
                });

                await Admin.save(findUser)

                OkResponse({
                    data: deleteFields(findUser)
                }, reply)

            } else {
                ErrorResponse("admin_passive", reply)
            }

        } else {
            ErrorResponse("password_wrong", reply)
        }

    } else {
        ErrorResponse("admin_not_found", reply)
    }
}

const login2fa = async (request, reply) => {

    const { code } = request.body
    const { user } = request

    const controlCode = twofactor.verifyToken(user.google_2fa_secret, code)

    if ((controlCode != null && controlCode.delta == 0) || user.google_2fa === 0) {

        user.token = await signData({
            id: user.id,
            username: user.username,
            google_2fa: true,
            smsfactor: false
        });

        await Admin.save(user)

        OkResponse({
            data: deleteFields(user)
        }, reply)

    } else {
        ErrorResponse("code_wrong", reply)
    }
}

const userData = async (request, reply) => {

    const { user } = request

    OkResponse({
        data: deleteFields(user)
    }, reply)
}

const changePassword = async (request, reply) => {

    const { currentPassword, newPassword, newPasswordAgain } = request.body
    const { user } = request

    const controlPassword = await verifyHash(currentPassword, user.password)

    if (controlPassword) {

        if (newPassword == newPasswordAgain) {

            const password = await doHash(newPassword);

            user.password = password;
            await Admin.save(user)

            OkResponse({
                messages: "change_password_ok"
            }, reply)

        } else {
            ErrorResponse("new_password_not_match", reply)
        }

    } else {
        ErrorResponse("currenct_password_wrong", reply)
    }
}

const userInformationUpdate = async (request, reply) => {

    const { first_name, last_name, birthdate, email_address, phone_number } = request.body
    const { user } = request

    user.first_name = first_name;
    user.last_name = last_name;
    user.birthdate = birthdate;
    user.email_address = email_address;
    user.phone_number = phone_number;

    await Admin.save(user)

    OkResponse({
        messages: "admin_information_update_ok"
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

        if(user.avatar && user.avatar != '' && user.avatar != null) {
            await deleteFile(user.avatar)
        }

        user.avatar = letUploadFile.files[0].fileUrl
        await Admin.save(user)

        return OkResponse({
            status: true,
            data: deleteFields(user)
        }, reply)

    } else {
        return ErrorResponseJson(letUploadFile, reply)
    }
}

const enable2fa = async (request, reply) => {

    const { user } = request

    const secret2fa = twofactor.generateSecret({ name: config.domain, account: user.email });

    if (secret2fa.secret) {

        const codes = createRandomCodes(9, 12).join(',');

        user.google_2fa_secret = secret2fa.secret;
        await Admin.save(user)
        
        const AdminCodes = await AdminGoogleVerifyCodes.findOneBy({ admin_id: user.id }) || await AdminGoogleVerifyCodes.create({})

        AdminCodes.admin_id = user.id;
        AdminCodes.codes = codes;
        AdminGoogleVerifyCodes.save(AdminCodes)

        OkResponse({
            data: {
                google: secret2fa,
                recovery_codes: codes
            }
        }, reply)

    } else {
        ErrorResponse("service_error", reply)
    }
}

const enable2faConfirm = async (request, reply) => {

    const { user } = request
    const { code } = request.body

    const controlCode = twofactor.verifyToken(user.google_2fa_secret, code)

    if (controlCode != null && controlCode.delta == 0) {

        user.google_2fa = 1
        await Admin.save(user)

        OkResponse({
            data: controlCode
        }, reply)

    } else {
        ErrorResponse("code_wrong", reply)
    }
}

const disable2fa = async (request, reply) => {

    const { user } = request

    user.google_2fa_secret = null;
    user.google_2fa = 0
    await Admin.save(user)

    await AdminGoogleVerifyCodes
    .createQueryBuilder()
    .delete()
    .from('AdminGoogleVerifyCodes')
    .where({ admin_id: user.id })
    .execute()

    OkResponse({}, reply)
}

const googleRecoveryCodes = async (request, reply) => {

    const { user } = request

    const getRecoveryCodes = await AdminGoogleVerifyCodes.findOneBy({ admin_id: user.id })

    if (getRecoveryCodes) {

        OkResponse({
            data: getRecoveryCodes.codes.split(',')
        }, reply)

    } else {
        ErrorResponse("no_recovery_codes", reply)
    }
}

const roleList = async (request, reply) => {
    OkResponse({
        data: request.routes
    }, reply)
}

const updateRole = async (request, reply) => {

    const { user } = request
    const { roles, admin_id } = request.body

    if(user.granded == 0) {

        const findAdmin = await Admin.findOneBy({ id: admin_id })

        if(findAdmin) {

            await AdminRole
                .createQueryBuilder()
                .delete()
                .from('AdminRole')
                .where({ admin_id: admin_id })
                .execute()

            if(roles.length > 0) {
                for (const role of roles) {
                    const AdminRole = await AdminRole.create({})

                    AdminRole.admin_id = admin_id;
                    AdminRole.role_page = role;
                    await AdminRole.save(AdminRole)
                }
            }

            OkResponse({}, reply)

        } else {
            ErrorResponse("admin_not_exists", reply)
        }

    } else {
        ErrorResponse("permission_denied", reply)
    }
}

const deleteFields = (user = {}) => {

    delete user.password
    delete user.google_2fa_secret
    delete user.sms_2fa_secret
    delete user.status
    delete user.created_at
    delete user.updated_at
    delete user.deleted_at

    return user
}

module.exports = {
    login,
    login2fa,
    userData,
    changePassword,
    userInformationUpdate,
    profilePhotoUpdate,
    enable2fa,
    disable2fa,
    enable2faConfirm,
    googleRecoveryCodes,
    roleList,
    updateRole
}