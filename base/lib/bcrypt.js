const bcrypt = require('bcrypt')
const saltRounds = 10;

const doHash = async (password = "") => {

    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    return hash
}

const verifyHash = async (password = "", hash = "") => {
    return await bcrypt.compareSync(password, hash);
}

module.exports = {
    doHash,
    verifyHash
}