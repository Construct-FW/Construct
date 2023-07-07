const { verifyToken } = require("../../../construct/base/lib/jwt")
const { ErrorResponse } = require("../../../construct/base/utils/responses")
const { datastore } = require('../../../construct/base/lib/typeorm')

const authControl = async (request, reply) => {

    const { token, lang } = request.headers

    const controlToken = await verifyToken(token)

    if (controlToken) {

        const Admin = datastore.store.getRepository('Admin')

        const findUser = await Admin.findOne({ where: {
                id: controlToken.id,
                token: token
            }
        }) || false
        
        if (!findUser) {
            ErrorResponse("admin_not_exists", reply, { logout: true })
        } else {
            if(findUser.google_2fa == 1 && !controlToken.google_2fa && request.url != '/auth/login2fa') {
                ErrorResponse("google_2fa_redirect", reply, { google_2fa: true })
            } else {
                request.user = findUser
            }
        }

    } else {
        ErrorResponse("admin_not_exists", reply, { logout: true })
    }

    return true
}

module.exports = {
    authControl
}