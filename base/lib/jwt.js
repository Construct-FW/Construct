const jwt = require('jsonwebtoken')
const config = require('../../../../app/config');

const signData = (signData = {}, expiresIn = undefined) => {

    let token = jwt.sign(signData, config.jwtToken.salt, { expiresIn: expiresIn || config.jwtToken.tokenExpire });

    return token;
}

const verifyToken = (token) => {

    let returnData = false

    try {
        returnData = jwt.verify(token, config.jwtToken.salt);
        if(new Date().getTime() > returnData.exp * 1000) {
            returnData = false;
        }
    } catch (err) {
        returnData = false
    }

    return returnData
}

module.exports = {
    signData,
    verifyToken
}