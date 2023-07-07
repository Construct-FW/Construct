const { OkResponse, ErrorResponse } = require('../../../base/utils/responses')
const { datastore } = require('../../../base/lib/typeorm')
const config = require('../../../../../app/config');
const fs = require('fs')
const axios = require('axios')

const tables = async (request, reply) => {
    
    const tables = await datastore.store.query('SHOW TABLES')

    return OkResponse({
        data : tables.reduce((o,n) => {
            o.push(Object.values(n)[0])
            return o
        }, [])
    }, reply)
}

const fields = async (request, reply) => {

    const { table } = request.query
    
    const fields = await datastore.store.query('SELECT DATA_TYPE, COLUMN_NAME, IS_NULLABLE, EXTRA, COLUMN_KEY from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA = "'+config.mysql.db+'" and table_name = "'+table+'"')
    
    return OkResponse({
        data: fields
    }, reply)
}

const modules = async (request, reply) => {

    const modules = fs.readdirSync(__dirname + '/../../../../../app/tools/').filter(n => n.includes('.json')).reduce((o,n) => {
        o.push({
            id: n.replace('.json', ''),
            name: n.replace('.json', '')
        })
        return o
    }, [])

    OkResponse({
        data: modules
    }, reply)
}

const moduleShow = async (request, reply) => {

    const { id } = request.params

    if(!fs.existsSync(__dirname + '/../../../../../app/tools/' + id + '.json')) {
        return ErrorResponse('module_not_found', reply)
    } else {
        const module = fs.readFileSync(__dirname + '/../../../../../app/tools/'+id+'.json', 'utf8')
    
        OkResponse({
            data: JSON.parse(module)
        }, reply)
    }
}

const createModule = async (request, reply) => {

    const { module_path, module_name, database_name, git_repository, api_functions, admin_functions, fields, relations, indexes } = request.body


    if(git_repository && git_repository != '') {

        try {
            await axios.get(git_repository)
        } catch (error) {
            return ErrorResponse('invalid_git_repository', reply)
        }

    }

    const createObject = { path: '', module: '', table: '', repository: '', fields: {}, relations: [], indices: [] }

    // informations
    createObject.path = module_path
    createObject.module = module_name
    createObject.table = database_name
    createObject.repository = git_repository

    // fields
    if(fields.length > 0) {
        fields.forEach(field => {
            createObject.fields[field.name] = { type: field.type }
            if(field.nullable) createObject.fields[field.name].nullable = true
            if(field.primary) createObject.fields[field.name].primary = true
            if(field.unique) createObject.fields[field.name].unique = true
            if(field.default && field.default != 'NONE') createObject.fields[field.name].default = field.default
            if(field.length) createObject.fields[field.name].size = field.length
            if(field.onUpdate && field.onUpdate != 'NONE') createObject.fields[field.name].onUpdate = field.onUpdate
            if(field.auto_increment) {
                createObject.fields[field.name].generated = true
                createObject.fields[field.name].primary = true
            }
        })
    }

    // admin functions
    createObject.admin_functions = admin_functions.reduce((o,n) => {
        if(!n.requireds || n.params.length == 0) {
            delete n.params
        }
        if(!n.requireds || n.requireds.length == 0) {
            delete n.requireds
        }
        o.push(n)
        return o
    }, [])

    // api functions
    createObject.api_functions = api_functions.reduce((o,n) => {
        if(!n.requireds || n.params.length == 0) {
            delete n.params
        }
        if(!n.requireds || n.requireds.length == 0) {
            delete n.requireds
        }
        o.push(n)
        return o
    }, [])

    // relations
    if(relations.length > 0) {
        relations.forEach(relation => {
            const relationObject = datastore.store.entityMetadatas.find(n => n.tableName == relation.to_table)
            if(relationObject) {
                createObject.relations.push({
                    name: relation.to_table,
                    target: relationObject.target,
                    type: relation.type,
                    joinColumn: {
                        name: relation.from_field,
                        referencedColumnName: relation.to_field
                    }
                })
            }
        })
    } else {
        delete createObject.relations
    }

    // indexes
    if(indexes.length > 0) {
        indexes.forEach(index => {
            createObject.indices.push({
                name: index.name,
                columns: index.fields,
                unique: index.type == 'UNIQUE' ? true : false,
                spatial: index.type == 'SPATIAL' ? true : false,
                fulltext: index.type == 'FULLTEXT' ? true : false
            })
        })
    } else {
        delete createObject.indices
    }

    // create module
    await fs.writeFileSync(__dirname + '/../../../../../app/tools/' + module_path + '.json', JSON.stringify(createObject, null, 4), 'utf8')

    return OkResponse({
        data: createObject
    }, reply)
}

module.exports = {
    tables,
    fields,
    modules,
    createModule,
    moduleShow
}