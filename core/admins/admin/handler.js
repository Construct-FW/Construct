const { OkResponse, ErrorResponse } = require('../../../base/utils/responses')
const { doHash } = require('../../../../construct/base/lib/bcrypt')
const { datastore } = require('../../../base/lib/typeorm')
const Admin = datastore.store.getRepository('Admin')
const { Like } = require('typeorm')

const list = async (request, reply) => {
    
    const { limit, offset, orderField, orderType, search } = request.query
    let order = ['admin.id', 'ASC']
    let where = {}

    if(orderField && orderType) {
        order = [orderField, orderType]
    }

    if(search) {
        where = { name : Like(`%${search}%`) }
    }

    const admins = await Admin.createQueryBuilder('admin')
        .where(where)
        .take(limit)
        .skip(offset)
        .orderBy(order[0], order[1])
        .getMany()
    
    const totalRows = await Admin.createQueryBuilder('admin')
        .where(where)
        .take(limit)
        .skip(offset)
        .orderBy(order[0], order[1])
        .getCount()


    return OkResponse({
        data : admins,
        meta: {
            total: totalRows,
            limit,
            offset
        }
    }, reply)
}

const show = async (request, reply) => {

    const { id } = request.params
    const admin = await Admin.createQueryBuilder('admin')
        .where({ id })
        .getOne()

    delete admin.password

    if(!admin) {
        return ErrorResponse('admin_not_found', reply)
    } else {
        return OkResponse({
            data: admin
        }, reply)
    }
}

const add = async (request, reply) => {

    const { adminname, email_address, first_name, last_name, birthdate, phone_number, password, status } = request.body
    
    let findAdmin = await Admin.createQueryBuilder('admin')
        .where({ adminname })
        .orWhere({ email_address })
        .getOne()

    if(!findAdmin) {

        const createModel = Admin.create({
            adminname,
            email_address,
            first_name,
            last_name,
            birthdate,
            phone_number,
            password: await doHash(password),
            status
        })
        
        const insertData = await Admin.insert(createModel)

        return OkResponse({
            id : insertData.raw.insertId || false
        }, reply)

    } else {
        return ErrorResponse('admin_already_exists', reply)
    }
}

const edit = async (request, reply) => {

    const { id } = request.params
    const { first_name, last_name, birthdate, phone_number, password, status } = request.body
    
    const createModel = await Admin.findOneBy({ id: id })

    if(first_name) {
        createModel.first_name = first_name
    }

    if(last_name) {
        createModel.last_name = last_name
    }

    if(birthdate) {
        createModel.birthdate = birthdate
    }

    if(phone_number) {
        createModel.phone_number = phone_number
    }

    if(password) {
        createModel.password = await doHash(password)
    }

    createModel.status = status || createModel.status
    
    await Admin.save(createModel)

    return OkResponse({
        data: createModel
    }, reply)
}

module.exports = {
    list,
    add,
    edit,
    show
}