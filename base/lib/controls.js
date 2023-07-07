const emailValidation = (email = '') => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
}

const phoneValidation = (phone = '') => {
    return String(phone).match(/^[\+]?([0-9][\s]?|[0-9]?)([(][0-9]{3}[)][\s]?|[0-9]{3}[-\s\.]?)[0-9]{3}[-\s\.]?[0-9]{4,6}$/im);
}

function randomChars(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getIpAddress(req = {}) {
    return req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        null;
}

function validateLatLng(lat, lng) {
    let pattern = new RegExp('^-?([1-8]?[1-9]|[1-9]0)\\.{1}\\d{1,6}');

    return pattern.test(lat) && pattern.test(lng);
}

const checkCoordinates = (address, paths) => {

    if (paths) {

        const allPaths = paths.c[0].reduce((o, n) => {
            o.lngs.push(parseFloat(n.lng));
            o.lats.push(parseFloat(n.lat));
            return o
        }, { lngs: [], lats: [] })

        const minimumLng = Math.min(...allPaths.lngs)
        const maximumLng = Math.max(...allPaths.lngs)
        const minimumLat = Math.min(...allPaths.lats)
        const maximumLat = Math.max(...allPaths.lats)

        if (parseFloat(address.lng) >= minimumLng && parseFloat(address.lng) <= maximumLng && parseFloat(address.lat) >= minimumLat && parseFloat(address.lat) <= maximumLat) {
            return true
        } else {
            return false
        }

    } else {
        return false
    }

}

const checkPassoword = (password) => {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])\S{8,}$/.test(password)
}

const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    emailValidation,
    phoneValidation,
    randomChars,
    randomNumber,
    validateLatLng,
    checkCoordinates,
    getIpAddress,
    checkPassoword,
    sleep
}