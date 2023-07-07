const { OkResponse, ErrorResponse } = require('construct').response
const { datastore } = require('construct').typeorm
const ModuleName = datastore.store.getRepository('ModuleName')
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

    const TableName = await ModuleName.createQueryBuilder('ModuleNameLower')
        .where(where)
        .take(limit)
        .skip(offset)
        .orderBy(order[0], order[1])
        .getMany()
    
    const totalRows = await ModuleName.createQueryBuilder('ModuleNameLower')
        .where(where)
        .take(limit)
        .skip(offset)
        .orderBy(order[0], order[1])
        .getCount()


    return OkResponse({
        data : TableName,
        meta: {
            total: totalRows,
            limit,
            offset
        }
    }, reply)
}

const show = async (request, reply) => {

    const { id } = request.params
    const ModuleNameLower = await ModuleName.createQueryBuilder('ModuleNameLower')
        .where({ id })
        .getOne()

    if(!ModuleNameLower) {
        return ErrorResponse('ModuleNameLower_not_found', reply)
    } else {
        return OkResponse({
            data: ModuleNameLower
        }, reply)
    }
}

const add = async (request, reply) => {
    const { name } = request.body
    
    const createModel = ModuleName.create({
        name
    })
    
    const insertData = await ModuleName.insert(createModel)

    return OkResponse({
        id : insertData.raw.insertId || false
    }, reply)
}

const edit = async (request, reply) => {

    const { id } = request.params
    const { name } = request.body
    
    const createModel = await ModuleName.findOneBy({ id: id })

    if(name) {
        createModel.name = name
    }
    
    await ModuleName.save(createModel)

    return OkResponse({
        data: createModel
    }, reply)
}

const del = async (request, reply) => {
    const { id } = request.params
    await ModuleName.delete({ id: id })

    return OkResponse({}, reply)
}

module.exports = {
    list,
    add,
    edit,
    del,
    show
}