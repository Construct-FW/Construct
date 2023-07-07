const seeds = require('./settings.json')

module.exports = async (dbData = false) => {
    const tableSeed = dbData.getRepository('Setting');
    const controlData = await tableSeed.find({ take: 1 });
    
    if(controlData.length == 0) {
        if(seeds.length > 0) {
            const dataInserts = []

            for (let c = 0; c < seeds.length; c++) {
                const seed = seeds[c];
                
                dataInserts.push(tableSeed.create(seed))
            }

            await tableSeed.insert(dataInserts)
        }
    }
}