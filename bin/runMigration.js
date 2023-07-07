const { connectDb, datastore } = require('../base/lib/typeorm');
const log = require('log-beautify')

const start = async () => {
    
    const connectionInfo = await connectDb(true)
    
    if (!connectionInfo.status) {
        log.error(connectionInfo.error);
        process.exit(1)
    } else {
        log.success('Migration has been successfully completed');
    }

    // Close the connection
    await connectionInfo.typeOrm.close()
}

start()