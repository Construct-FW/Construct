const fs = require('fs');
const path = require('path');
const baseDirCore = path.join(__dirname, '../../core');
const baseDirModules = path.join(__dirname, '../../../../app/modules');
const config = require('../../../../app/config');

/**
 * Returns the name of the given file without extension.
 * @param {string} file filename
 */
let removeExtension = (file) => {
    let extension = path.extname(file);
    return file.replace(extension, '');
};

/**
 * Automatically adds routing from the base directory to Fastify.
 * @param {object} fastify Fastify object
 * @param {boolean} openAdmin run admin or api
 */
let registerRoutes = (fastify, openAdmin = false) => {
    const lookDirectory = openAdmin ? 'admin' : 'api';
    const modules = process.argv.slice(4);
    
    if(config.disablecore === false) {
        fs.readdirSync(baseDirCore)
        .forEach(file => {
            if(modules.length > 0 && modules.indexOf(file) === -1) {
                return;
            }
            if (fs.existsSync(`${baseDirCore}/${file}/${lookDirectory}/route.js`)) {
                const readFile = fs.readFileSync(`${baseDirCore}/${file}/${lookDirectory}/route.js`, 'utf-8');
                if(readFile.length > 0) {
                    fastify.register(require(`${baseDirCore}/${file}/${lookDirectory}/route.js`), {
                        prefix: '/' + file
                    });
                }
            }
        });
    }
    fs.readdirSync(baseDirModules)
        .forEach(file => {
            if(modules.length > 0 && modules.indexOf(file) === -1) {
                return;
            }
            if (fs.existsSync(`${baseDirModules}/${file}/${lookDirectory}/route.js`)) {
                const readFile = fs.readFileSync(`${baseDirModules}/${file}/${lookDirectory}/route.js`, 'utf-8');
                if(readFile.length > 0) {
                    fastify.register(require(`${baseDirModules}/${file}/${lookDirectory}/route.js`), {
                        prefix: '/' + file
                    });
                }
            }
        });
};

module.exports = function (baseDir) {
    return function (fastify, opts, next) {
        registerRoutes(fastify, baseDir);
        next();
    }
};