const { OkResponse, ErrorResponse } = require('../../../base/utils/responses')
const { doHash } = require('../../../../construct/base/lib/bcrypt')
const { datastore } = require('../../../base/lib/typeorm')
const Migration = datastore.store.getRepository('construct_migrations')
const { Like } = require('typeorm')

const list = async (request, reply) => {
    
    const { limit, offset, orderField, orderType, search } = request.query
    let order = ['id', 'ASC']
    let where = {}

    if(orderField && orderType) {
        order = [orderField, orderType]
    }

    if(search) {
        where = { name : Like(`%${search}%`) }
    }

    const migrations = await Migration.createQueryBuilder()
        .where(where)
        .take(limit)
        .skip(offset)
        .orderBy(order[0], order[1])
        .getMany()
    
    const totalRows = await Migration.createQueryBuilder()
        .where(where)
        .take(limit)
        .skip(offset)
        .orderBy(order[0], order[1])
        .getCount()


    return OkResponse({
        data : migrations,
        meta: {
            total: totalRows,
            limit,
            offset
        }
    }, reply)
}

module.exports = {
    list
}