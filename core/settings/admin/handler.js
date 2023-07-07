const { OkResponse, ErrorResponse } = require('../../../base/utils/responses')
const { datastore } = require('../../../base/lib/typeorm')
const { uploadFile, deleteFile } = require('../../../../construct/base/lib/upload.js');
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

const edit = async (request, reply) => {

    const body = request.body
    const settings = await Setting.createQueryBuilder('setting').getMany()
    const reduceSettings = settings.reduce((acc, setting) => {
        acc[setting.key] = setting
        return acc
    }, {})

    if(Object.keys(body).length > 0) {
        for (const key of Object.keys(body)) {
            const settingGet = await Setting.createQueryBuilder('setting').where({ key }).getOne()
            
            if(reduceSettings[key]) {
                if(reduceSettings[key].value_type != 2) {
                    settingGet.value = body[key].value
                    reduceSettings[key].value = body[key].value
                    await Setting.save(settingGet)
                } else {
                    const letUploadFile = await uploadFile(body[key], key, 'settings', false)

                    if(letUploadFile.status) {
                        await deleteFile(reduceSettings[key].value)
                        settingGet.value = letUploadFile.file.fileUrl
                        reduceSettings[key].value = letUploadFile.file.fileUrl
                        await Setting.save(settingGet)
                    }
                }
            }
        }
    }
    
    OkResponse({
        data: reduceSettings
    }, reply)
}

module.exports = {
    list,
    edit
}