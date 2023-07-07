const { Table, TableForeignKey } = require("typeorm")
const fs = require("fs")
const config = require('../../../app/config');

module.exports = class MigrationContstruct {

        constructor(modelName = '', tableName = '') {
            
            if(modelName !== tableName) {
                if(fs.existsSync(__dirname + '/../core/'+modelName+'/modules/' + tableName) && !config.disablecore) {
                    this.callModel = require(__dirname + '/../core/'+modelName+'/modules/' + tableName)
                } else if(fs.existsSync(process.cwd() + '/app/modules/'+modelName+'/modules/' + tableName)) {
                    this.callModel = require(process.cwd() + '/app/modules/'+modelName+'/modules/' + tableName)
                } else {
                    this.callModel = false
                }
            } else {
                if(fs.existsSync(__dirname + '/../core/'+modelName+'/model.js') && !config.disablecore) {
                    this.callModel = require(__dirname + '/../core/'+modelName+'/model.js')
                } else if(fs.existsSync(process.cwd() + '/app/modules/'+modelName+'/model.js')) {
                    this.callModel = require(process.cwd() + '/app/modules/'+modelName+'/model.js')
                } else {
                    this.callModel = false
                }
            }

        }

        async up(queryRunner) {

            if(this.callModel) {
                const createColumns = Object.entries(this.callModel.options.columns).reduce((o,n) => {
                    const createdObject = Object.assign({ name: n[0]}, n[1]);

                    if(createdObject.primary) {
                        createdObject.isPrimary = true;
                    }

                    if(createdObject.generated) {
                        createdObject.isGenerated = true;
                        if(typeof createdObject.generated !== 'boolean') {
                            createdObject.generationStrategy = createdObject.generated;
                        } else {
                            createdObject.generationStrategy = 'increment';
                        }
                    }

                    if(createdObject.unique) {
                        createdObject.isUnique = true;
                    }

                    if(createdObject.nullable) {
                        createdObject.isNullable = true;
                    }

                    o.push(createdObject)
                    return o
                }, [])

                await queryRunner.createTable(new Table({
                    name: this.callModel.options.tableName,
                    columns: createColumns,
                }), true)

                if(this.callModel.options.relations) {
                    const foreignKeys = Object.entries(this.callModel.options.relations).reduce((o,n) => {
                        const createdObject = Object.assign({ name: n[0]}, n[1]);

                        o.push(createdObject)
                        return o
                    }, [])

                    for (let i = 0; i < foreignKeys.length; i++) {
                        const foreignKey = foreignKeys[i];
                        
                        if(foreignKey.joinColumn) {
                            if(Array.isArray(foreignKey.joinColumn)) {
                                for (let j = 0; j < foreignKey.joinColumn.length; j++) {
                                    const joinColumn = foreignKey.joinColumn[j];
                                    try {
                                        await queryRunner.createForeignKey(this.callModel.options.tableName, new TableForeignKey({
                                            columnNames: [joinColumn.name],
                                            referencedColumnNames: [joinColumn.referencedColumnName],
                                            referencedTableName: foreignKey.name,
                                            onDelete: foreignKey.onDelete || 'NO ACTION',
                                            onUpdate: foreignKey.onUpdate || 'NO ACTION'
                                        }), true)
                                    } catch (error) {
                                        console.log(error?.sqlMessage);
                                    }
                                }
                            } else {
                                try {
                                    await queryRunner.createForeignKey(this.callModel.options.tableName, new TableForeignKey({
                                        columnNames: [foreignKey.joinColumn.name],
                                        referencedColumnNames: [foreignKey.joinColumn.referencedColumnName],
                                        referencedTableName: foreignKey.name,
                                        onDelete: foreignKey.onDelete || 'NO ACTION',
                                        onUpdate: foreignKey.onUpdate || 'NO ACTION'
                                    }), true)
                                } catch (error) {
                                    console.log(error?.sqlMessage);
                                }
                            }
                        }
                    }
                }

                if(this.callModel.options.indices && this.callModel.options.indices.length > 0) {
                    for (let i = 0; i < this.callModel.options.indices.length; i++) {
                        const indice = this.callModel.options.indices[i];
                        const createObject = {
                            isUnique: indice.unique || false,
                            isFulltext: indice.fulltext || false,
                            isSpatial: indice.spatial || false,
                            name: indice.name || '',
                            columnNames: indice.columns || []
                        }
                        await queryRunner.createIndex(this.callModel.options.tableName, createObject, true)
                    }
                }
            }
        }

        async down(queryRunner) {
            if(this.callModel) {
                await queryRunner.dropTable(this.callModel.options.tableName, true)
            }
        }
}