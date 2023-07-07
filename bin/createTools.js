const fs = require('fs');
const log = require('log-beautify')
const basePath = process.cwd() + '/app/modules/';
const basePathTools = process.cwd() + '/app/tools';
const handlerAuthKeys = ['id','created_at', 'updated_at']
const defaultFuncs = ['list', 'create', 'update', 'delete', 'show']
const isDevelopment = true

const createTools = async () => {

    const readDirs = await fs.readdirSync(basePathTools).filter(n => n != '.gitkeep')
    
    if(readDirs.length > 0) {
        for (let rd = 0; rd < readDirs.length; rd++) {
            const directory = readDirs[rd];
            const isDirectory = await fs.lstatSync(basePathTools + '/' + directory).isDirectory()
            
            if(isDirectory) {
                const readDirInside = await fs.readdirSync(basePathTools + '/' + directory).filter(n => n != '.gitkeep')
                if(readDirInside.length > 0) {
                    for (let rdi = 0; rdi < readDirInside.length; rdi++) {
                        const dirInside = readDirInside[rdi];
                        const checkStatFile = await fs.lstatSync(basePathTools + '/' + directory + '/' + dirInside).isFile()
                        
                        if(checkStatFile) {
                            const getJSON = require(basePathTools + '/' + directory + '/' + dirInside)
                            parseFile(getJSON)
                        }
                    }
                }
            } else {
                const getJSON = require(basePathTools + '/' + directory)
                parseFile(getJSON)
            }
        }
    }
}

const parseFile = async (pages = {}) => {

    if(!await fs.existsSync(basePath + pages.path)) {
        
        const basePathModule = basePath + pages.path + '/'
        fs.mkdirSync(basePathModule, { recursive: true })

        if (pages.admin_functions.length > 0) {
            // create admin directory
            const basePathAdmin = basePath + pages.path + '/admin/'
            fs.mkdirSync(basePathAdmin, { recursive: true })
            // create for admin
            createHandler(basePathAdmin, pages.admin_functions, pages.module, pages.table, pages.fields)
            createRoute(basePathAdmin, pages.admin_functions, pages.module, pages.table, pages.fields)
            createValidation(basePathAdmin, pages.admin_functions, pages.module, pages.table, pages.fields)
        }

        if (pages.api_functions.length > 0) {
            // create api directory
            const basePathApi = basePath + pages.path + '/api/'
            fs.mkdirSync(basePathApi, { recursive: true })
            // create for api
            createHandler(basePathApi, (pages.api_functions || pages.functions), pages.module, pages.table, pages.fields)
            createRoute(basePathApi, (pages.api_functions || pages.functions), pages.module, pages.table, pages.fields)
            createValidation(basePathApi, (pages.api_functions || pages.functions), pages.module, pages.table, pages.fields)
        }

        createModule(basePathModule, pages.module, pages.table, pages.fields, pages.relations, pages.indices)
        log.ok('Module ' + pages.module + ' created')

    } else {
        log.warn('Module ' + pages.module + ' already exists')
    }
    

    return true
}

const createHandler = async (path = '', functions = [], module = '', database = '', fields = []) => {

    let createVariable = '';
    createVariable += "const { OkResponse, ErrorResponse } = require('construct').response\n"
    createVariable += "const { datastore } = require('construct').typeorm\n"
    createVariable += "const "+module+" = datastore.store.getRepository('"+module+"')\n"

    
    const searchableFields = Object.values(fields).find(n => n.searchable);
    if(functions.find(n => n.func == 'list') && searchableFields) {
        createVariable += "const { Like } = require('typeorm')\n\n"
    } else {
        createVariable += "\n"
    }

    if(functions.length > 0) {
        for (let i = 0; i < functions.length; i++) {
            const func = functions[i];
            func.name = func.name == 'delete' ? 'del' : func.name
            if(await fs.existsSync(__dirname + '/./functions/handlers/'+func.func+'.js')) {
                const callFunc = fs.readFileSync(__dirname + '/./functions/handlers/'+func.func+'.js', 'utf8');
                createVariable += replaceFieldsForHandlers(replaceKeywords(callFunc, module, database, func.name), fields)
            }
            createVariable += '\n\n'
        }
    }

    createVariable += 'module.exports = {\n';
    if(functions.length > 0) {
        for (let i = 0; i < functions.length; i++) {
            let func = functions[i];
            func.name = func.name == 'delete' ? 'del' : func.name
            createVariable += createLine(4, func.name, (functions.length != i+1), true);    
        }
    }
    createVariable += '}';

    await fs.writeFileSync(path + 'handler.js', createVariable)

    return true
}

const createRoute = async (path = '', functions = [], module = '', database = '', fields = []) => {

    let createVariable = '';
    const listOfHandlers = []
    const listOfValidations = []

    if(functions.length > 0) {
        for (let i = 0; i < functions.length; i++) {
            const func = functions[i];
            func.name = func.name == 'delete' ? 'del' : func.name
            listOfHandlers.push(func.name)
            listOfValidations.push(func.name + 'Schema')
        }
    }
    
    createVariable += "const { "+listOfHandlers.join(', ')+" } = require('./handler')\n"
    createVariable += "const { "+listOfValidations.join(', ')+" } = require('./validation')\n\n"
    createVariable += "module.exports = async (fastify, opts, next) => {\n\n"

    if(functions.length > 0) {
        for (let i = 0; i < functions.length; i++) {
            const func = functions[i];
            func.name = func.name == 'delete' ? 'del' : func.name
            if(await fs.existsSync(__dirname + '/./functions/routes/'+func.func+'.js')) {
                const callFunc = fs.readFileSync(__dirname + '/./functions/routes/'+func.func+'.js', 'utf8');
                createVariable += createLine(4, replaceKeywords(callFunc, module, database, func.name).replace(/\n/g, '\n'+createLine(4, '', false, false)))
            }
            createVariable += '\n\n'
        }
    }

    createVariable += '}';

    await fs.writeFileSync(path + 'route.js', createVariable)

    return true
}

const createValidation = async (path = '', functions = [], module = '', database = '', fields = []) => {

    let createVariable = "const swagger = require('construct').swagger\n\n";

    if(functions.length > 0) {
        for (let i = 0; i < functions.length; i++) {
            const func = functions[i];
            func.name = func.name == 'delete' ? 'del' : func.name
            if(await fs.existsSync(__dirname + '/./functions/validations/'+func.func+'.js')) {
                const callFunc = fs.readFileSync(__dirname + '/./functions/validations/'+func.func+'.js', 'utf8');
                createVariable += replaceFieldsFormValidation(replaceKeywords(callFunc, module, database, func.name), fields)
            }
            createVariable += '\n\n'
        }
    }

    createVariable += 'module.exports = {\n';
    if(functions.length > 0) {
        for (let i = 0; i < functions.length; i++) {
            let func = functions[i];
            func.name = func.name == 'delete' ? 'del' : func.name
            createVariable += createLine(4, func.name + 'Schema', (functions.length != i+1), true);    
        }
    }
    createVariable += '}';

    await fs.writeFileSync(path + 'validation.js', createVariable)

    return true
}

const createModule = async (path = '', module = '', database = '', fields = [], relations = [], indices = []) => {

    let createVariable = 'const EntitySchema = require("typeorm").EntitySchema;\n\n'
    createVariable += 'module.exports = new EntitySchema({\n'
    createVariable += createLine(4, 'name: "'+module+'",', false, true)
    createVariable += createLine(4, 'tableName: "'+database+'",', false, true)
    createVariable += createLine(4, 'columns: {', false, true)
    
    const fieldEntities = Object.entries(fields)
    // fields
    if(fieldEntities.length > 0) {
        for (let i = 0; i < fieldEntities.length; i++) {
            const field = fieldEntities[i];
            createVariable += createLine(8, field[0]+': {', false, true)
            if(field[1].type) {
                createVariable += createLine(12, 'type: "'+field[1].type+'",', false, true)
            }
            if(field[1].length) {
                createVariable += createLine(12, 'length: '+field[1].length+',', false, true)
            }
            if(field[1].nullable) {
                createVariable += createLine(12, 'nullable: '+field[1].nullable+',', false, true)
            }
            if(field[1].primary) {
                createVariable += createLine(12, 'primary: '+field[1].primary+',', false, true)
            }
            if(field[1].unique) {
                createVariable += createLine(12, 'unique: '+field[1].unique+',', false, true)
            }
            if(field[1].default) {
                if(field[1].default == 'NULL') {
                    createVariable += createLine(12, 'default: null,', false, true)
                } else {
                    createVariable += createLine(12, 'default: "'+field[1].default+'",', false, true)
                }
            }
            if(field[1].generated) {
                createVariable += createLine(12, 'generated: '+field[1].generated+',', false, true)
            }
            if(field[1].comment) {
                createVariable += createLine(12, 'comment: "'+field[1].comment+'",', false, true)
            }
            if(field[1].precision) {
                createVariable += createLine(12, 'precision: "'+field[1].precision+'",', false, true)
            }
            if(field[1].scale) {
                createVariable += createLine(12, 'scale: "'+field[1].scale+'",', false, true)
            }
            if(field[1].collation) {
                createVariable += createLine(12, 'collation: "'+field[1].collation+'",', false, true)
            }
            if(field[1].charset) {
                createVariable += createLine(12, 'charset: "'+field[1].charset+'",', false, true)
            }
            if(field[1].onUpdate) {
                createVariable += createLine(12, 'onUpdate: "'+field[1].onUpdate+'",', false, true)
            }

            createVariable += createLine(8, '}', true, true)
        }
    }

    createVariable += createLine(4, '}', (((relations && relations.length > 0) || (indices && indices.length > 0)) ? true : false), true)

    if(relations && relations.length > 0) {
        createVariable += createLine(4, 'relations: {', false, true)
        for (let i = 0; i < relations.length; i++) {
            const relation = relations[i];
            createVariable += createLine(8, relation.name+': {', false, true)
            createVariable += createLine(12, 'target: "'+relation.target+'",', false, true)
            createVariable += createLine(12, 'type: "'+relation.type+'",', false, true)
            createVariable += createLine(12, 'joinColumn: {', false, true)
            createVariable += createLine(16, 'name: "'+relation.joinColumn.name+'",', false, true)
            createVariable += createLine(16, 'referencedColumnName: "'+relation.joinColumn.referencedColumnName+'",', false, true)
            createVariable += createLine(12, '}', true, true)
            createVariable += createLine(8, '}', true, true)
        }
        createVariable += createLine(4, '}', (indices && indices.length > 0 ? true : false), true)
    }

    if(indices && indices.length > 0) {
        createVariable += createLine(4, 'indices: [', false, true)
        for (let i = 0; i < indices.length; i++) {
            const indice = indices[i];
            createVariable += createLine(8, '{', false, true)
            createVariable += createLine(12, 'columns : [', false, true)
            if(indice.columns && indice.columns.length > 0) {
                for (let j = 0; j < indice.columns.length; j++) {
                    const column = indice.columns[j];
                    createVariable += createLine(16, '"'+column+'"', (indice.columns.length != j+1 ? true : false), true)
                }
            }
            createVariable += createLine(12, ']', true, true)
            createVariable += createLine(12, 'name : "' + indice.name + '"', true, true)
            createVariable += createLine(12, 'unique : ' + indice.unique, true, true)
            createVariable += createLine(12, 'spatial : ' + indice.spatial, true, true)
            createVariable += createLine(12, 'fulltext : ' + indice.fulltext, false, true)
            createVariable += createLine(8, '}', (indices.length != i+1 ? true : false), true)
        }
        createVariable += createLine(4, ']', false, true)
    }

    createVariable += '})'

    await fs.writeFileSync(path + 'model.js', createVariable)

    return true
}

const createLine = (spaceLength = 4, text = '', comma = false, nextLine = false) => {

    let space = '';

    for (let i = 0; i < spaceLength; i++) {
        space += ' ';
    }

    return space + text + (comma ? ',' : '') + (nextLine ? '\n' : '');
}

const replaceKeywords = (text = '', module = '', database = '', funcname = '') => {
    const titleCaseDatabase = titleCase(database).replace(/\s/g, '')
    const urlPath = defaultFuncs.includes(funcname) ? '' : funcname + '/'
    funcname = funcname == 'delete' ? 'del' : funcname
    return text.replace(/ModuleNameLower/g, module.toLowerCase()).replace(/TableNameTitle/g, titleCaseDatabase).replace(/ModuleName/g, module).replace(/TableName/g, database).replace(/FunctionName/g, funcname).replace(/UrlName/g, urlPath)
}

const replaceFieldsForHandlers = (text = '', fields = []) => {

    let field_text = '';
    let field_text_with_enter = ''
    let update_fields = '';
    let search_fields_all = '';
    const getFields = Object.entries(fields).filter(n => !handlerAuthKeys.includes(n[0]))
    if(getFields.length > 0) {
        for (let i = 0; i < getFields.length; i++) {
            const field = getFields[i];
            field_text += field[0] + (getFields.length != i+1 ? ', ' : '')
            field_text_with_enter += createLine(i != 0 ? 8 : 0, field[0], (getFields.length != i+1), (getFields.length != i+1))
            update_fields += createLine((i != 0 ? 4 : 0), 'if('+field[0]+') {', false, true)
            update_fields += createLine(8, 'updateModel.'+field[0]+' = '+field[0]+'', false, true)
            update_fields += createLine(4, '}\n', false, (getFields.length != i+1))

            if(field[1].searchable) {
                if(search_fields_all == '') {
                    search_fields_all += 'if(search) {\n'
                    search_fields_all += createLine(8, 'where = [', false, true)
                }
                search_fields_all += createLine(12, '{ '+ field[0] +' : Like(`%${search}%`) }', true, true)
            }
        }

        if(search_fields_all != '') {
            search_fields_all += createLine(8, ']', false, true)
            search_fields_all += createLine(4, '}', false, true)
        }
    }

    return text.replace(/field_list_all/g, field_text).replace(/field_list_enter/g, field_text_with_enter).replace(/update_field_area/g, update_fields).replace(/search_fields_all/g, search_fields_all)
}

const replaceFieldsFormValidation = (text = '', fields = []) => {

    let required_fields = '';
    let field_list_properties = ''
    let sortable_fields = ''
    const getFields = Object.entries(fields).filter(n => !handlerAuthKeys.includes(n[0]))
    if(getFields.length > 0) {
        for (let i = 0; i < getFields.length; i++) {
            const field = getFields[i];
            
            if(field[1].required) {
                required_fields += (required_fields != '' ? ', ' : '\n' + createLine(8,'required: [')) + "'" + field[0] + "'"
            }
            
            let default_value = ''
            let maxLength = ''
            type = field[1].type == 'varchar' ? 'string' : field[1].type
            type = field[1].type == 'int' ? 'number' : type
            type = field[1].type == 'text' ? 'string' : type
            type = field[1].type == 'longtext' ? 'string' : type
            type = field[1].type == 'mediumtext' ? 'string' : type
            type = field[1].type == 'tinyint' ? 'boolean' : type

            if(field[1].type == 'varchar') {
                maxLength = ', maxLength: ' + (field[1].length ? field[1].length : 255)
            }

            if(field[1].default) {
                default_value = ', default: ' + (field[1].default == 'NULL' ? 'null' : field[1].default)
            }

            if(field[1].sortable) {
                sortable_fields += ", '" + field[0] + "'"
            }

            nullable = field[1].nullable === false ? ', nullable:false' : ', nullable:false'
            field_list_properties += createLine((i == 0 ? 0 : 12), field[0] + ': { type: "'+type+'"'+maxLength+nullable+default_value + ' }', (i == getFields.length-1 ? false : true), (i == getFields.length-1 ? false : true))
        }

        if(required_fields != '') {
            required_fields += '],'
        }
    }

    return text.replace(/required_fields/g, required_fields).replace(/field_list_properties/g, field_list_properties).replace(/sortable_fields/g, sortable_fields)
}

const titleCase = (str = '') => {
    str = str.replace(/_/g, ' ')
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
    }
    return str.join(' ');
}

createTools()