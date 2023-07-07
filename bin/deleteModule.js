const fs = require('fs');
const log = require('log-beautify');

const start = async () => {
    
    if(process.argv[2] !== undefined) {

        try {
            const toPath = process.argv[2];
            
            if(fs.existsSync(process.cwd() + '/app/modules/' + toPath)) {
                const fileInner = require(process.cwd() + '/app/modules/' + toPath + '/model.js');
                
                if(!fileInner.relations) {
                    fs.rmdirSync(process.cwd() + '/app/modules/' + toPath, { recursive: true });
                    log.success(`Module deleted successfully!`);
                } else {
                    log.error(`Module has relations, delete them first!`);
                }

            } else {
                log.error(`Module does not exist!`);
            }

        } catch (error) {
            log.error(error)
        }

    } else {
        log.error('Please enter module path');
        process.exit(1);
    }
    
}

start()