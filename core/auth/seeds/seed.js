const { doHash } = require("../../../base/lib/bcrypt");
const config = require('../../../../../app/config');

module.exports = async (dbData = false) => {
    const tableSeed = dbData.getRepository('Admin');
    const controlData = await tableSeed.find({ where: { username: config.defaultadmin.username } });
    
    if(controlData.length == 0) {
        await tableSeed.insert(tableSeed.create({
            username: config.defaultadmin.username,
            email_address: config.siteInfo.email,
            first_name: config.siteInfo.name,
            status: 1,
            password: await doHash(config.defaultadmin.password)
        }))
    }
}