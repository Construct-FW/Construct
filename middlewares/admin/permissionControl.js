const { ErrorResponse } = require("../../base/utils/responses")

const permissionControl = async (request, reply, role_name = '', justAdmin = false) => {

    const { user } = request
    const permissions = await permissionData(user.id)
    
    if ((justAdmin && user.level != 0) || (user.level != 0 && !permissions.includes(role_name))) {
        ErrorResponse("permission_error", reply, { justAdmin })
    }

    return true
}

const permissionData = async (admin_id = 0) => {

    const getRoles = await knex('admin_roles').where({ admin_id })
    
    return getRoles.reduce((o,n) => {
        o.push(n.role_name)
        return o
    }, [])
}

module.exports = {
    permissionControl
} 