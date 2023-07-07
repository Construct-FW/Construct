const { I18n } = require('i18n');
const path = require('path');

const i18n = new I18n({
    locales: ['en'],
    defaultLocale: 'en',
    objectNotation: true,
    directory: path.join(__dirname, '../../../../app/languages')
});

module.exports = i18n;