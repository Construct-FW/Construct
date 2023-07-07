const { OkResponse, ErrorResponse } = require('../../../base/utils/responses')
const { doHash } = require('../../../../construct/base/lib/bcrypt')
const { datastore } = require('../../../base/lib/typeorm')
const User = datastore.store.getRepository('User')
const UserProfile = datastore.store.getRepository('UserProfile')
const { Like } = require('typeorm')

const list = async (request, reply) => {
    
    const { limit, offset, orderField, orderType, search } = request.query
    let order = ['user.id', 'ASC']
    let where = {}

    if(orderField && orderType) {
        order = [orderField, orderType]
    }

    if(search) {
        where = { name : Like(`%${search}%`) }
    }

    const users = await User.createQueryBuilder('user')
        .where(where)
        .leftJoinAndSelect('user.profile', 'profile')
        .take(limit)
        .skip(offset)
        .orderBy(order[0], order[1])
        .getMany()
    
    const totalRows = await User.createQueryBuilder('user')
        .where(where)
        .take(limit)
        .skip(offset)
        .orderBy(order[0], order[1])
        .getCount()


    return OkResponse({
        data : users,
        meta: {
            total: totalRows,
            limit,
            offset
        }
    }, reply)
}

const show = async (request, reply) => {

    const { id } = request.params
    const user = await User.createQueryBuilder('user')
        .where({ id })
        .leftJoinAndSelect('user.profile', 'profile')
        .getOne()

    delete user.password

    if(!user) {
        return ErrorResponse('user_not_found', reply)
    } else {
        return OkResponse({
            data: user
        }, reply)
    }
}

const add = async (request, reply) => {

    const { username, email_address, first_name, last_name, birthdate, gender, phone_number, password, status } = request.body
    
    let findUser = await User.createQueryBuilder('user')
        .where({ username })
        .orWhere({ email_address })
        .getOne()

    if(!findUser) {

        const createModel = User.create({
            username,
            email_address,
            phone_number,
            activation_code: '111111',
            email_verify: true,
            password: await doHash(password),
            status
        })
        
        const insertData = await User.insert(createModel)

        const profile = await UserProfile.create({})
        profile.first_name = first_name
        profile.last_name = last_name
        profile.birthdate = birthdate
        profile.gender = gender
        profile.user_id = insertData.raw.insertId
        await UserProfile.insert(profile)

        return OkResponse({
            id : insertData.raw.insertId || false
        }, reply)

    } else {
        return ErrorResponse('user_already_exists', reply)
    }
}

const edit = async (request, reply) => {

    const { id } = request.params
    const { first_name, last_name, birthdate, phone_number, password, status, gender } = request.body
    
    const user = await User.findOneBy({ id: id })
    const profile = await UserProfile.findOneBy({ user_id: id })

    if(first_name) {
        profile.first_name = first_name
    }

    if(last_name) {
        profile.last_name = last_name
    }

    if(birthdate) {
        profile.birthdate = birthdate
    }

    if(phone_number) {
        user.phone_number = phone_number
    }

    if(password) {
        user.password = await doHash(password)
    }

    if(gender) {
        profile.gender = gender
    }

    user.status = status || user.status
    
    await User.save(user)
    await UserProfile.save(profile)

    return OkResponse({
        data: Object.assign({}, user, profile)
    }, reply)
}

module.exports = {
    list,
    add,
    edit,
    show
}