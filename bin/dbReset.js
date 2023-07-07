const log = require('log-beautify');
const config = require(__dirname + '/../../../app/config');
const execSync = require('child_process').execSync;

// get the client
const mysql = require('mysql2/promise');

const start = async () => {

    // create the connection to database
    const connection = await mysql.createConnection({
        host: config.mysql.host,
        user: config.mysql.user,
        password: config.mysql.pass,
        port: config.mysql.port
    });

    // Drop database
    await connection.execute('DROP DATABASE IF EXISTS ' + config.mysql.db);
    log.success(config.mysql.db + ' Database dropped');

    // Create database
    await connection.execute('CREATE DATABASE ' + config.mysql.db);
    log.success(config.mysql.db + ' Database created');

    // Close connection
    await connection.end();
    log.success('Connection closed');

    try {
        // Run yarn command with execSync yarn migrate:run
        await execSync('construct db:migrate', { stdio: 'inherit', encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 })
        log.success('Migration done');
    } catch (error) {
        
    }

    try {
        // Run yarn command with execSync yarn seed:run
        await execSync('construct db:seed', { stdio: 'inherit', encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
        log.success('Seed done');
    } catch (error) {
        
    }
    
}

start()