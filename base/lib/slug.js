const slugify = require('slugify')
const config = require('../../../../app/config');

const returnSlug = (title = "") => {
    return slugify(title.toLowerCase(), config.slugConfig)
}

module.exports = returnSlug