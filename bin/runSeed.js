const fs = require('fs')
const path = require('path')
const baseDirCore = path.join(__dirname, "../core")
const baseDirModules = path.join(process.cwd(), "/app/modules")
const { connectDb, entityFiles, orderMigrationFiles } = require('../base/lib/typeorm');
const log = require('log-beautify')
const config = require('../../../app/config');

const start = async () => {
    
    const connectionInfo = await connectDb()
    
    if (!connectionInfo.status) {
        console.log(connectionInfo.error);
        process.exit(1)
    } else {
        console.log('Database connected');
    }

    await seedRunner(connectionInfo.typeOrm)

    // Close the connection
    await connectionInfo.typeOrm.close()
}

const seedRunner = async (dataBase) => {

    const seedFiles = []

    log.show('Reading seed files')

    const coreSeed = await fs.readdirSync(baseDirCore)
    const moduleSeed = await fs.readdirSync(baseDirModules)

    if(coreSeed.length > 0 && !config.disablecore) {
        for (let ce = 0; ce < coreSeed.length; ce++) {
            const seed = coreSeed[ce];
            const exists = await fs.existsSync(baseDirCore + "/" + seed);
            const stats = exists && await fs.statSync(baseDirCore + "/" + seed);
            const isDirectory = exists && await stats.isDirectory();

            if(isDirectory) {
                if(fs.existsSync(baseDirCore + "/" + seed + '/seeds/seed.js')) {
                    seedFiles.push({
                        name: seed,
                        file: baseDirCore + "/" + seed + '/seeds/seed.js'
                    });
                }
            }
        }
    }

    if(moduleSeed.length > 0) {
        for (let me = 0; me < moduleSeed.length; me++) {
            const seed = moduleSeed[me];
            const exists = await fs.existsSync(baseDirModules + "/" + seed);
            const stats = exists && await fs.statSync(baseDirModules + "/" + seed);
            const isDirectory = exists && await stats.isDirectory();

            if(isDirectory) {
                if(fs.existsSync(baseDirModules + "/" + seed + '/seeds/seed.js')) {
                    seedFiles.push({
                        name: seed,
                        file: baseDirModules + "/" + seed + '/seeds/seed.js'
                    });
                }
            }
        }
    }

    let entities = await entityFiles();
    const orderEntities = orderMigrationFiles(entities.list);
    
    const orderSeeds = seedFiles.reduce((o,n) => {
        const findEntry = orderEntities.find(d => d.module == n.name) || 0
        n.sortKey = findEntry.sortKey
        o.push(n)
        return o
    }, []).sort((a,b) => {
        return a.sortKey - b.sortKey
    })
    
    if(orderSeeds.length > 0) {
        for (let se = 0; se < orderSeeds.length; se++) {
            const seed = orderSeeds[se];
            log.info('Running seed file: ' + seed.name)
            const seedFile = require(seed.file)
            
            if(typeof seedFile === 'function') {
                await seedFile(dataBase)
                log.success('Seed file: ' + seed.name + ' completed')
            } else {
                log.error('Seed file: ' + seed.name + ' not a function')
            }
        }
    }

    log.ok('Seed files executed')
    
    return true
}

start()