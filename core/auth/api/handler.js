const { OkResponse, ErrorResponse } = require('../../../../construct/base/utils/responses');
const { verifyToken, signData } = require('../../../../construct/base/lib/jwt');
const { doHash, verifyHash } = require('../../../../construct/base/lib/bcrypt')
const { randomChars, emailValidation, checkPassoword, randomNumber } = require('../../../../construct/base/lib/controls')
const config = require('../../../../../app/config');
const { sendEmail } = require('../../../../construct/base/lib/nodemailer')
const axios = require('axios');
const { downloadFile } = require('../../../../construct/base/lib/upload.js');

const { datastore } = require('../../../../construct/base/lib/typeorm')
const User = datastore.store.getRepository('User')
const UserProfile = datastore.store.getRepository('UserProfile')

const login = async (request, reply) => {
    
    const { username, password } = request.body

    let findUser = await User.createQueryBuilder('user')
        .where({ username })
        .orWhere({ email_address: username })
        .leftJoinAndSelect("user.profile", "profile")
        .getOne()
    
    if (findUser) {

        const controlPassword = await verifyHash(password, findUser.password);

        if (controlPassword) {

            if (findUser.status == 1) {

                findUser.token = await signData({
                    id: findUser.id,
                    email: findUser.email_address,
                    username: findUser.username
                });

                await User.save(findUser)
                
                return OkResponse({
                    messages: "login_ok",
                    data: deleteFields(findUser)
                }, reply)

            } else {
                return ErrorResponse("user_passive", reply)
            }

        } else {
            return ErrorResponse("password_wrong", reply)
        }

    } else {
        return ErrorResponse("user_not_exists", reply)
    }
}

const register = async (request, reply) => {

    const { email, username, password } = request.body        

    let checkUsername = await User.createQueryBuilder('user').where({ username }).getOne()

    if (!checkUsername) {

        if (email && emailValidation(email)) {
        
            const emailUniqueControl = await User.createQueryBuilder('user').where({ email_address: email }).getOne()

            if (!emailUniqueControl) {

                if(checkPassoword(password)) {

                    const user = await User.create({})

                    user.email_address = email
                    user.username = username
                    user.activation_code = randomNumber(100000,999999)
                    user.password = await doHash(password)
                    user.status = 1
                    
                    const insert = await User.insert(user)

                    const profile = await UserProfile.create({})
                    profile.user_id = insert.identifiers[0].id
                    await UserProfile.insert(profile)

                    await sendEmail(email, "Activation", 'verify', { 
                        email_address: email,
                        activation_code: user.activation_code,
                        username: user.username
                    }, request.headers.host)

                    const getUser = await User.findOne({ where: {
                            id: insert.identifiers[0].id
                        },
                        relations: {
                            profile: true
                        }
                    }) || false

                    if(getUser) {

                        getUser.token = await signData({
                            id: getUser.id,
                            email: getUser.email_address,
                            username: getUser.username
                        });

                        return OkResponse({
                            messages: "register_ok",
                            data : deleteFields(getUser)
                        }, reply)

                    } else {
                        return ErrorResponse('register_error', reply)
                    }

                } else {
                    return ErrorResponse('password_not_valid', reply)
                }
                
            } else {
                return ErrorResponse('email_already_exists', reply)
            }
            
        } else {
            return ErrorResponse('email_not_valid', reply)
        }

    } else {
        return ErrorResponse('username_already_exists', reply)
    }
}

const activation = async (request, reply) => {

    const { code } = request.body
    const { user } = request

    if (user.activation_code == code) {

        user.email_verify = true

        User.save(user)

        OkResponse({
            messages: 'activation_ok',
            data: deleteFields(user)
        }, reply)

    } else {
        return ErrorResponse('activation_code_wrong', reply)
    }
}

const forgotPassword = async (request, reply) => {

    const { username } = request.body

    let findUser = await User.createQueryBuilder('user')
        .where({ username })
        .orWhere({ email_address: username })
        .getOne()

    if (findUser) {

        const hashActivation = await doHash(findUser.email_address);
        const userid = await signData({ id: findUser.id, email: findUser.email_address });
        
        await sendEmail(findUser.email_address, "Forgot Password", 'forgotpassword', { 
            name: (findUser.first_name || findUser.last_name) ? findUser.first_name + ' ' + (findUser.last_name || '') : findUser.username, 
            reset_link: "https://" + config.domain + '/changepassword?hash=' + encodeURIComponent(hashActivation) + '&token=' + userid 
        }, request.headers.host)

        return OkResponse({
            messages: 'forgot_password_ok'
        }, reply)

    } else {
        return ErrorResponse("user_not_exists", reply)
    }
}

const resetPassword = async (request, reply) => {

    const { hash, userid, newPassword, confirmPassword } = request.body

    let controlToken = await verifyToken(userid);

    if (controlToken) {

        let findUser = await User.createQueryBuilder('user').where({ id: controlToken.id }).getOne()

        if (findUser) {

            let activationVerify = await verifyHash(findUser.email_address, hash);

            if(activationVerify) {
                if (newPassword == confirmPassword) {

                    if(checkPassoword(newPassword)) {

                        const password = await doHash(newPassword);

                        findUser.password = password
                        
                        User.save(findUser)

                        return OkResponse({
                            messages: 'reset_password_ok'
                        }, reply)

                    } else {
                        return ErrorResponse('password_not_valid', reply)
                    }

                } else {
                    return ErrorResponse("new_password_not_match", reply)
                }
            } else {
                return ErrorResponse("activation_code_wrong", reply)
            }

        } else {
            return ErrorResponse("user_not_exists", reply)
        }

    } else {
        return ErrorResponse("user_not_exists", reply)
    }
}

const changePassword = async (request, reply) => {

    const { currentPassword, newPassword, newPasswordAgain } = request.body
    const { user } = request

    const controlPassword = await verifyHash(currentPassword, user.password)

    if (controlPassword) {

        if (newPassword == newPasswordAgain) {

            if(checkPassoword(newPassword)) {

                const password = await doHash(newPassword);

                user.password = password
                User.save(user)

                return OkResponse({
                    messages: "change_password_ok"
                }, reply)

            } else {
                return ErrorResponse('password_not_valid', reply)
            }

        } else {
            return ErrorResponse("new_password_not_match", reply)
        }

    } else {
        return ErrorResponse("currenct_password_wrong", reply)
    }
}

const googleCallback = async (request, reply, fastify) => {

    const token = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
    
    if (token.access_token) {

        const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token.access_token)
        
        let checkUser = await User.createQueryBuilder('user')
        .where({ email_address: data.email })
        .getOne()

        if(!checkUser) {

            let username = data.email.substring(0, data.email.indexOf('@'));
            let checkUsername = await User.createQueryBuilder('user')
                .where({ username })
                .getOne()

            if (checkUsername) {
                username = username + randomChars(8)
            }

            const user = await User.create({})

            user.email_address = data.email
            user.email_verify = data.verified_email ? true : false
            user.username = username
            user.password = await doHash(randomChars(15))
            user.first_name = data.given_name
            user.last_name = data.family_name
            user.phone_number = ''
            user.status = 1

            const insert = await User.insert(user)

            if (insert.raw.insertId) {

                let findUser = await User.createQueryBuilder('user')
                    .where({ id: insert.raw.insertId })
                    .getOne()

                findUser.token = await signData({
                    id: findUser.id,
                    email: findUser.email_address,
                    username: findUser.username
                });

                const downloadPicture = await downloadFile(data.picture.replace('s96', 's400'), 'socials')

                if(downloadPicture.status) {
                    findUser.profile_photo = downloadPicture.file.id
                }

                User.save(findUser)

                OkResponse({
                    data: deleteFields(findUser)
                }, reply)

            } else {
                ErrorResponse('user_already_exists', reply)
            }

        } else {

            checkUser.token = await signData({
                id: checkUser.id,
                email: checkUser.email_address,
                username: checkUser.username
            });

            OkResponse({
                data: deleteFields(checkUser)
            }, reply)

        }

    } else {
        ErrorResponse('user_not_exists', reply)
    }
}

const githubCallback = async (request, reply, fastify) => {

    const token = await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)

    if (token.access_token) {

        const { data } = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': 'token ' + token.access_token
            }
        })

        let checkUser = await User.createQueryBuilder('user')
        .where({ email_address: data.email })
        .getOne()

        if (!checkUser) {

            let username = data.email.substring(0, data.email.indexOf('@'));
            let checkUsername = await User.createQueryBuilder('user')
                .where({ username })
                .getOne()

            if (checkUsername) {
                username = username + randomChars(8)
            }

            const user = await User.create({})

            user.email_address = data.email
            user.email_verify = true
            user.username = username
            user.password = await doHash(randomChars(15))
            user.first_name = data.name.split(' ')[0]
            user.last_name = data.name.split(' ')[1] || '--',
            user.phone_number = ''
            user.status = 1

            const insert = await User.insert(user)

            if (insert.raw.insertId) {

                let findUser = await User.createQueryBuilder('user')
                    .where({ id: insert.raw.insertId })
                    .getOne()

                findUser.token = await signData({
                    id: findUser.id,
                    email: findUser.email_address,
                    username: findUser.username
                });

                const downloadPicture = await downloadFile(data.avatar_url, 'socials')

                if(downloadPicture.status) {
                    findUser.profile_photo = downloadPicture.file.id
                }

                User.save(findUser)

                OkResponse({
                    data: deleteFields(findUser)
                }, reply)

            } else {
                ErrorResponse('user_already_exists', reply)
            }

        } else {

            checkUser.token = await signData({
                id: checkUser.id,
                email: checkUser.email_address,
                username: checkUser.username
            });

            User.save(checkUser)

            OkResponse({
                data: deleteFields(checkUser)
            }, reply)

        }

    } else {
        ErrorResponse('user_not_exists', reply)
    }
}

const facebookCallback = async (request, reply, fastify) => {

    const token = await fastify.facebookOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)

    const { data } = await axios.get('https://graph.facebook.com/v6.0/me', {
        headers : {
            Authorization: 'Bearer ' + token.access_token
        }
    })

    console.log(data, token);
    
    OkResponse({status:true}, reply)
}

const spotifyCallback = async (request, reply, fastify) => {

    const token = await fastify.spotifyOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)

    if(token.access_token) {
        const { data } = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: 'Bearer ' + token.access_token
            }
        })

        let checkUser = await User.createQueryBuilder('user')
            .where({ email_address: data.email })
            .getOne()

        if (!checkUser) {

            let username = data.email.substring(0, data.email.indexOf('@'));
            let checkUsername = await User.createQueryBuilder('user')
                .where({ username })
                .getOne()

            if (checkUsername) {
                username = username + randomChars(8)
            }

            const user = await User.create({})

            user.email_address = data.email
            user.email_verify = true
            user.username = username
            user.password = await doHash(randomChars(15))
            user.first_name = data.display_name.split(' ')[0]
            user.last_name = data.display_name.split(' ')[1] || '--',
            user.phone_number = ''
            user.status = 1

            const insert = await User.insert(user)

            if (insert.raw.insertId) {

                let findUser = await User.createQueryBuilder('user')
                    .where({ id: insert.raw.insertId })
                    .getOne()

                findUser.token = await signData({
                    id: findUser.id,
                    email: findUser.email_address,
                    username: findUser.username
                });

                User.save(findUser)

                OkResponse({
                    data: deleteFields(findUser)
                }, reply)

            } else {
                ErrorResponse('user_already_exists', reply)
            }

        } else {

            checkUser.token = await signData({
                id: checkUser.id,
                email: checkUser.email_address,
                username: checkUser.username
            });

            delete checkUser.password

            OkResponse({
                data: deleteFields(checkUser)
            }, reply)

        }

    } else {
        ErrorResponse('user_not_exists', reply)
    }
}

const linkedinCallback = async (request, reply, fastify) => {
    
    const token = await fastify.linkedinOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)

    if(token.access_token) {
        
        try {
            const { data:emailData } = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
                headers: {
                    Authorization: 'Bearer ' + token.access_token
                }
            })

            const email_address = emailData.elements[0]['handle~'].emailAddress;

            let checkUser = await User.createQueryBuilder('user')
                .where({ email_address: email_address })
                .getOne()

            if (!checkUser) {

                const { data } = await axios.get('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,public-profile-url,profilePicture(displayImage~:playableStreams))', {
                    headers: {
                        Authorization: 'Bearer ' + token.access_token
                    }
                })
                
                const profile_picture = data.profilePicture && data.profilePicture['displayImage~'] ? data.profilePicture['displayImage~'].elements[2].identifiers[0].identifier : false;
                
                let username = email_address.substring(0, email_address.indexOf('@'));
                let checkUsername = await User.createQueryBuilder('user')
                    .where({ username })
                    .getOne()

                if (checkUsername) {
                    username = username + randomChars(8)
                }

                const user = await User.create({})

                user.email_address = email_address
                user.email_verify = true
                user.username = username
                user.password = await doHash(randomChars(15))
                user.first_name = data.localizedFirstName
                user.last_name = data.localizedLastName,
                user.phone_number = ''
                user.status = 1

                const insert = await User.insert(user)

                if (insert.raw.insertId) {

                    let findUser = await User.createQueryBuilder('user')
                        .where({ id: insert.raw.insertId })
                        .getOne()

                    findUser.token = await signData({
                        id: findUser.id,
                        email: findUser.email_address,
                        username: findUser.username
                    });

                    if(profile_picture) {
                        const downloadPicture = await downloadFile(profile_picture, 'socials')

                        if(downloadPicture.status) {
                            findUser.profile_photo = downloadPicture.file.id
                        }
                    }

                    User.save(findUser)

                    OkResponse({
                        data: deleteFields(findUser)
                    }, reply)

                } else {
                    ErrorResponse('user_already_exists', reply)
                }

            } else {

                checkUser.token = await signData({
                    id: checkUser.id,
                    email: checkUser.email_address,
                    username: checkUser.username
                });

                delete checkUser.password

                OkResponse({
                    data: deleteFields(checkUser)
                }, reply)

            }

        } catch (error) {
            ErrorResponse('user_not_exists', reply)
        }

    } else {
        ErrorResponse('user_not_exists', reply)
    }
}

const deleteFields = (user = {}) => {

    delete user.password
    delete user.activation_code
    delete user.status
    delete user.created_at
    delete user.updated_at
    delete user.deleted_at

    if(user.profile) {
        user.profile.avatar = user.profile.avatar && user.profile.avatar != null ? config.cdn + user.profile.avatar : null
    }

    return user
}

module.exports = {
    login,
    googleCallback,
    githubCallback,
    facebookCallback,
    spotifyCallback,
    linkedinCallback,
    register,
    activation,
    forgotPassword,
    resetPassword,
    changePassword
}