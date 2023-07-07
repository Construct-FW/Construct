const swagger = require('../../../base/lib/swagger')

const tableSchema = {
    tags: ['Database'],
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const fieldSchema = {
    tags: ['Database'],
    query: {
        type: 'object',
        reqiured: ['table'],
        properties: {
            table: { type: 'string', minLength: 1 }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const modulesSchema = {
    tags: ['Database'],
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const moduleShowSchema = {
    tags: ['Database'],
    params: {
        type: 'object',
        reqiured: ['id'],
        properties: {
            id: { type: 'string', minLength: 1 }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

const createModuleSchema = {
    tags: ['Database'],
    body: {
        type: 'object',
        required: ['module_path', 'module_name', 'database_name', 'fields'],
        properties: {
            module_path: { type: 'string', minLength: 1 },
            module_name: { type: 'string', minLength: 1 },
            database_name: { type: 'string', minLength: 1 },
            git_repository: { type: 'string' },
            fields: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['name', 'type'],
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        type: { type: 'string', enum: ['int', 'varchar', 'date', 'datetime', 'time', 'timestamp', 'year', 'float', 'double', 'decimal', 'tinyint', 'bigint', 'mediumint', 'longtext', 'mediumtext', 'text', 'json', 'boolean'] },
                        nullable: { type: 'boolean' },
                        auto_increment: { type: 'boolean' },
                        length: { type: 'integer', minLength: 1 },
                        default: { type: 'string', enum: ['NONE', 'CURRENT_TIMESTAMP', 'NOW()', 'NULL', 'EMPTY'] },
                        onUpdate: { type: 'string', enum: ['CURRENT_TIMESTAMP', 'NONE'] }
                    }
                }
            },
            indexes: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['name', 'type', 'fields'],
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        type: { type: 'string', enum: ['PRIMARY', 'UNIQUE', 'INDEX', 'FULLTEXT', 'SPATIAL'] },
                        fields: {
                            type: 'array',
                            items: {
                                type: 'string',
                                minLength: 1
                            }
                        }
                    }
                }
            },
            relations: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['from_field', 'to_field', 'to_table'],
                    properties: {
                        from_field: { type: 'string', minLength: 1 },
                        to_field: { type: 'string', minLength: 1 },
                        to_table: { type: 'string', minLength: 1 }
                    }
                }
            },
            admin_functions: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['name', 'func', 'params'],
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        func: { type: 'string', enum: ['list', 'upload', 'create', 'show', 'update', 'delete'] },
                        params: {
                            type: 'array',
                            items: {
                                type: 'string',
                                minLength: 0
                            }
                        }
                    }
                }
            },
            api_functions: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['name', 'func', 'params'],
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        func: { type: 'string', enum: ['list', 'upload', 'create', 'show', 'update', 'delete'] },
                        params: {
                            type: 'array',
                            items: {
                                type: 'string',
                                minLength: 0
                            }
                        }
                    }
                }
            }
        }
    },
    headers: swagger.swagger.headers,
    security: [{ token: swagger.swagger.securityDefinitions.token }]
}

module.exports = {
    tableSchema,
    fieldSchema,
    modulesSchema,
    moduleShowSchema,
    createModuleSchema
}