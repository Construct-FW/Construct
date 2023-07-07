const i18n = require('../lib/i18n')

const OkResponse = (data = {}, reply) => {
    let response = { status: true, data: [], messages: [], meta: null };

    response = Object.assign(response, data);

    response.messages = response.messages ? Array.isArray(response.messages) ? response.messages : [response.messages] : null;
    response.messages = languageForMessages(response.messages);

    if(!Array.isArray(response.data)) {
        response.data = [response.data]
    }

    reply.send(response);
};

const ErrorResponse = (message = '', reply) => {

    let response = { status: false, data: [], messages: [], meta: null }
    
    response.messages = Array.isArray(message) ? message : [message]
    response.messages = languageForMessages(response.messages)

    reply.send(response)
};

const ErrorResponseJson = (message = {}, reply) => {
    reply.send(Object.assign(message, {
        status: false
    }))
};

const languageForMessages = (messages = []) => {

    let newMessages = []

    for(let message of messages) {
        newMessages.push(i18n.__(message))
    }

    return newMessages
}

module.exports = {
    OkResponse,
    ErrorResponse,
    ErrorResponseJson
};