const { verifyToken } = require("../../../construct/base/lib/jwt")
const { ErrorResponse } = require("../../../construct/base/utils/responses")
const { datastore } = require('../../../construct/base/lib/typeorm')

const authControl = async (request, reply) => {

    const { token, lang } = request.headers
    const { id } = request.params

    const controlToken = await verifyToken(token)

    if (controlToken) {

        if(id && (id != 'me')) {
            // Permission controls will be here
            return ErrorResponse("permission_denied", reply)
        }

        const User = datastore.store.getRepository('User')

        const findUser = await User.findOne({ where: {
                id: controlToken.id
            },
            relations: {
                profile: true
            }
        }) || false
        
        if (!findUser) {
            return ErrorResponse("user_not_exists", reply)
        } else {
            if(findUser.status == 1) {
                if(findUser.email_verify == 1) {
                    request.user = findUser
                    return true
                } else if(request.url == '/auth/login' || request.url.includes('/auth/activation') || request.url.includes('/auth/update')) {
                    request.user = findUser
                    return true
                } else {
                    return ErrorResponse("email_not_verify", reply)
                }
            } else {
                request.user = findUser
            }
            // if(findUser.google_2fa == 1 && !controlToken.google_2fa && request.url != '/auth/login2fa') {
            //     ErrorResponse("google_2fa_redirect", reply, { google_2fa: true })
            // } else {
            // }
        }

    } else {
        return ErrorResponse("user_not_exists", reply)
    }

    return true
}

module.exports = {
    authControl
}