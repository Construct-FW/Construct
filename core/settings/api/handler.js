const { OkResponse, ErrorResponse } = require('../../../base/utils/responses')
const { datastore } = require('../../../base/lib/typeorm')
const Setting = datastore.store.getRepository('Setting')
const { Like } = require('typeorm')

const list = async (request, reply) => {
    
    const { limit, offset, orderField, orderType, search } = request.query
    let order = ['id', 'ASC']
    let where = { status : 1 }

    if(orderField && orderType) {
        order = [orderField, orderType]
    }

    if(search) {
        where = { key : Like(`%${search}%`) }
    }

    const settings = await Setting.createQueryBuilder('setting')
        .where(where)
        .take(limit)
        .skip(offset)
        .orderBy(order[0], order[1])
        .getMany()


    return OkResponse({
        data : settings,
        limit,
        offset
    }, reply)
}

module.exports = {
    list
}