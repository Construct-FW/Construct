const { randomChars } = require('./controls') 

const createRandomCodes = (howmany = 1, lengthOfCodes = 10) => {

    const codes = []
    
    for (let i = 0; i < howmany; i++) {
        const createCode = randomChars(lengthOfCodes)
        codes.push(createCode);
    }

    return codes
}

module.exports = {
    createRandomCodes
}