const path = require('path');
const fs = require('fs');
const log = require('log-beautify');

const start = async () => {
    
    if(process.argv[2] !== undefined) {

        try {
            const fromPath = 'modulempty';
            const toPath = process.argv[2];
            const database = process.argv[3] || 'dbname';
            const module = process.argv[4] || 'ModuleName';
            
            if(await fs.existsSync(__dirname + '/' + fromPath)) {

                    await copyRecursiveSync(__dirname + '/' + fromPath, process.cwd() + '/app/modules/' + toPath, database, module)

                    log.ok('Module created successfully');

            } else {
                log.error('Empty Module folder not found');
                process.exit(1);
            }

        } catch (error) {
            log.error(error)
        }

    } else {
        log.error('Please enter module path');
        process.exit(1);
    }
}

const copyRecursiveSync = async (src, dest, database, module) => {

    const exists = await fs.existsSync(src);
    const stats = exists && await fs.statSync(src);
    const isDirectory = exists && await stats.isDirectory();
    
    if (isDirectory) {
        await fs.mkdirSync(dest);
        const readDir = await fs.readdirSync(src);
        if(readDir.length > 0) {
            for (const childItemName of readDir) {
                await copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName), database, module);
            }
        }
    } else {
        await fs.copyFileSync(src, dest);
        await fs.writeFileSync(dest, await fs.readFileSync(dest, 'utf8').replace(/ModuleNameLower/g, module.toLowerCase()).replace(/TableNameTitle/g, titleCase(database)).replace(/ModuleName/g, module).replace(/TableName/g, database));
    }

    return true;
};

const titleCase = (str = '') => {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
    }
    return str.join(' ');
}

start()