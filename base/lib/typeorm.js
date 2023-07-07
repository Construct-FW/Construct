const fs = require("fs")
const path = require("path")
const { DataSource, EntitySchema } = require("typeorm")
const config = require('../../../../app/config');
const baseDirCore = path.join(__dirname, "../../core")
const baseDirModules = path.join(__dirname, "../../../../app/modules")
const baseDirMigrations = path.join(__dirname, "../../../../app/migrations")

const datastore = { store: {} }

const entityFiles = async () => {

    const entities = { files : [], list: [] }

    const coreEntities = await fs.readdirSync(baseDirCore)
    const moduleEntities = await fs.readdirSync(baseDirModules)

    if(coreEntities.length > 0 && !config.disablecore) {
        for (let ce = 0; ce < coreEntities.length; ce++) {
            const entity = coreEntities[ce];
            const exists = await fs.existsSync(baseDirCore + "/" + entity);
            const stats = exists && await fs.statSync(baseDirCore + "/" + entity);
            const isDirectory = exists && await stats.isDirectory();
            
            if(isDirectory) {
                if(fs.existsSync(baseDirCore + "/" + entity + '/modules')) {
                    const moduleEntities = await fs.readdirSync(baseDirCore + "/" + entity + '/modules')
                    if(moduleEntities.length > 0) {
                        for (let me = 0; me < moduleEntities.length; me++) {
                            const entityMod = moduleEntities[me];
                            const exists = await fs.existsSync(baseDirCore + "/" + entity + '/modules/' + entityMod);
                            if(exists) {
                                const entityFile = require(baseDirCore + "/" + entity + '/modules/' + entityMod)
                                
                                if(Object.keys(entityFile).length > 0) {
                                    entities.files.push(entityFile)
                                    entities.list.push({ module: entity, name: entityMod, database: entityFile.options.tableName, relations: Object.keys(entityFile.options.relations || []) })
                                }
                            }
                        }
                    }
                }
                
                if(fs.existsSync(baseDirCore + "/" + entity + '/model.js')) {
                    const entityCall = require(baseDirCore + "/" + entity + '/model.js');

                    if(Object.keys(entityCall).length > 0) {
                        entities.files.push(entityCall)
                        entities.list.push({ module: entity, name: entity, database: entityCall.options.tableName, relations: Object.keys(entityCall.options.relations || []) })
                    }
                }
            }
        }
    }

    if(moduleEntities.length > 0) {
        for (let me = 0; me < moduleEntities.length; me++) {
            const entity = moduleEntities[me];
            const exists = await fs.existsSync(baseDirModules + "/" + entity);
            const stats = exists && await fs.statSync(baseDirModules + "/" + entity);
            const isDirectory = exists && await stats.isDirectory();

            if(isDirectory) {
                if(fs.existsSync(baseDirModules + "/" + entity + '/modules')) {
                    const moduleEntities = await fs.readdirSync(baseDirModules + "/" + entity + '/modules')
                    if(moduleEntities.length > 0) {
                        for (let me = 0; me < moduleEntities.length; me++) {
                            const entityMod = moduleEntities[me];
                            const exists = await fs.existsSync(baseDirModules + "/" + entity + '/modules/' + entityMod);
                            if(exists) {
                                const entityFile = require(baseDirModules + "/" + entity + '/modules/' + entityMod)
                                
                                if(Object.keys(entityFile).length > 0) {
                                    entities.files.push(entityFile)
                                    entities.list.push({ module: entity, name: entityMod, database: entityFile.options.tableName, relations: Object.keys(entityFile.options.relations || []) })
                                }
                            }
                        }
                    }
                }
                
                if(fs.existsSync(baseDirModules + "/" + entity + '/model.js')) {
                    const entityCall = require(baseDirModules + "/" + entity + '/model.js');
                    
                    if(Object.keys(entityCall).length > 0) {
                        entities.files.push(entityCall)
                        entities.list.push({ module: entity, name: entity, database: entityCall.options.tableName, relations: Object.keys(entityCall.options.relations || []) })
                    }
                }
            }
        }
    }

    return entities
}

const callMigrations = async (entityFiles = []) => {
    
    const migrations = []
    const migrationClass = require('../../bin/migration.js');
    const orderEntities = orderMigrationFiles(entityFiles)

    if(orderEntities.length > 0) {
        for (let i = 0; i < orderEntities.length; i++) {
            const entity = orderEntities[i];

            const nameMigration = entity.module + '_' + entity.name.split('.')[0] + new Date('2021-10-30').getTime();
            const getMigrationClass = new migrationClass(entity.module, entity.name);
            let migration = class extends migrationClass {
                constructor() {
                    super(entity.module, entity.name)
                }
                up = getMigrationClass.up;
                down = getMigrationClass.down;
            }
            Object.defineProperty(migration, 'name', { value: nameMigration})
            migrations.push(migration)
        }
    }

    const customMigrations = await fs.readdirSync(baseDirMigrations)
    
    if(customMigrations.length > 0) {
        for (let i = 0; i < customMigrations.length; i++) {
            const migration = customMigrations[i];
            const exists = await fs.existsSync(baseDirMigrations + "/" + migration);
            const stats = exists && await fs.statSync(baseDirMigrations + "/" + migration);
            const isFile = exists && await stats.isFile();
            
            if(isFile) {
                const migrationCall = require(baseDirMigrations + "/" + migration);
                if(typeof migrationCall === 'function') {
                    migrations.push(migrationCall)
                }
            }
        }
    }
    
    return migrations;
}

const connectDb = async (doMigration = false) => {

    const entityFilesRaw = await entityFiles();
    const sourceObject = {
        type: "mysql",
        host: config.mysql.host,
        port: config.mysql.port,
        username: config.mysql.user,
        password: config.mysql.pass,
        database: config.mysql.db,
        synchronize: false,
        logging: config.isDevelopment,
        entities: [...entityFilesRaw.files, migrationEntry()]
    }

    if(doMigration) {
        const migrations = await callMigrations(entityFilesRaw.list);
        sourceObject.migrations = migrations;
        sourceObject.migrationsRun = true;
        sourceObject.migrationsTableName = 'construct_migrations';
    }
    
    datastore.store = new DataSource(sourceObject)

    try {
        const data = await datastore.store.initialize()
        
        return {
            status: true,
            data,
            typeOrm: datastore.store,
            msg: "Database connected"
        }
    } catch (error) {
        return {
            status: false,
            error
        }
    }
}

const orderMigrationFiles = (entityFiles = []) => {
    
    let sortByRelationLength = entityFiles.sort((a, b) => a.relations.length - b.relations.length)
    let lastSort = 0
    for (let rr = 0; rr < sortByRelationLength.length; rr++) {
        const entity = sortByRelationLength[rr];
        const relations = entity.relations || []

        if(relations.length > 0) {
            orderBefore = []
            for (let rel = 0; rel < relations.length; rel++) {
                const relation = relations[rel];
                const findRelation = entityFiles.find(e => e.database === relation)

                if(findRelation && findRelation.sortKey) {
                    orderBefore.push(findRelation.sortKey)
                }
            }

            if(orderBefore.length > 0) {
                entity.sortKey = Math.max(...orderBefore) + 10 + relations.length
            } else {
                lastSort = lastSort + 1;
                entity.sortKey = lastSort
            }
        } else {
            lastSort = lastSort + 1;
            entity.sortKey = lastSort
        }

        
        const checkModules = sortByRelationLength.filter(e => e.relations.includes(entity.database))
        if(checkModules.length > 0) {
            for (let cm = 0; cm < checkModules.length; cm++) {
                const checkmo = checkModules[cm];
                checkmo.sortKey = checkmo.sortKey ? checkmo.sortKey + entity.sortKey : entity.sortKey + 1
            }
        }
    }
    
    return sortByRelationLength.sort((a, b) => a.sortKey - b.sortKey)
}

const migrationEntry = () => {
    return new EntitySchema({
        name: "Migration",
        tableName: "construct_migrations",
        columns: {
            id: {
                primary: true,
                type: "int",
                generated: true
            },
            name: {
                type: "varchar",
            },
            timestamp: {
                type: "timestamp",
            }
        }
    })
}

module.exports = {
    datastore,
    connectDb,
    entityFiles,
    orderMigrationFiles
}