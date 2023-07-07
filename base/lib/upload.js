const fs = require('fs');
const axios = require('axios');
const { randomChars, sleep } = require('./controls');
const uploadBase = process.cwd() + '/public/uploads/'
const { resize: resizeImage } = require('./image')
const sizeOf = require('image-size');
const config = require('../../../../app/config');
const returnSlug = require('./slug')
const { uploadAws } = require('./aws');

const uploadFile = async (fileObject = {}, prefix = '', directory = '', resizeOpts = false) => {

    try {

        if (directory != '' && !fs.existsSync(uploadBase + directory)) {
            await fs.mkdirSync(uploadBase + directory);
        }

        let fileExt = fileObject.filename.split('.')
        fileExt = fileExt[fileExt.length - 1];
        const fileName = returnSlug((prefix != '' ? prefix + '_' : '') + '_' + randomChars(16)) + '.' + fileExt
        directory = directory != '' ? directory + '/' : ''

        await fs.writeFileSync(uploadBase + directory + fileName, fileObject._buf)

        return await createReturnData(fileName, directory, resizeOpts, fileObject)

    } catch (error) {
        return {
            status: false,
            error
        }

    }

}

const createReturnData = async (fileName = '', directory = '', resizeOpts = false, fileObject = false) => {

    let returnData = {
        status: false
    }

    let awsError = false

    if (resizeOpts) {
        returnData = await resizeImage(directory + fileName, resizeOpts, 90, directory.replace(/\//g, ''))
        returnData.resize = true
    } else {
        let dimensions = {}

        if(fileObject && fileObject.mimetype.includes('image')) {
            dimensions = sizeOf(uploadBase + directory + fileName)
        }

        returnData = {
            status: true,
            resize: false,
            file: {
                width: dimensions.width || 'none',
                height: dimensions.height || 'none',
                field: fileObject.fieldname,
                encoding: fileObject.encoding,
                mimetype: fileObject.mimetype,
                fileUrl: directory + fileName
            }
        }
    }

    if(config.aws.status) {

        await sleep(1000);

        if (returnData.resize) {
            if (returnData.files.length > 0) {
                for (let rfi = 0; rfi < returnData.files.length; rfi++) {
                    const file = returnData.files[rfi];
                    let statusUploadAws = await uploadAws(file.fileUrl, fileObject.mimetype)
                    
                    if(!statusUploadAws.status) {
                        awsError = {
                            status: false,
                            msg: "aws_upload_error"
                        }
                    }
                    
                    fs.unlinkSync(uploadBase + file.fileUrl)
                }
            }
        } else {
            let statusUploadAws = await uploadAws(returnData.file.fileUrl, returnData.file.mimetype)

            if (!statusUploadAws.status) {
                awsError = {
                    status: false,
                    messages: "aws_upload_error"
                }
            }
            fs.unlinkSync(uploadBase + returnData.file.fileUrl)
        }
    }

    if (returnData.resize) {
        fs.unlinkSync(uploadBase + directory + fileName)
    }
    
    if(awsError) {
        return awsError
    } else {
        return returnData
    }

}

const downloadFile = async (fileUrl = "", directory = '') => {

    try {

        if (directory != '' && !fs.existsSync(uploadBase + directory)) {
            await fs.mkdirSync(uploadBase + directory);
        }

        const fileName = randomChars(3) + new Date().getTime() + '.jpg'
        directory = directory != '' ? directory + '/' : ''

        const writer = await fs.createWriteStream(uploadBase + directory + fileName);

        axios({
            method: 'GET',
            url: fileUrl,
            responseType: 'stream',
        }).then(response => {

            //ensure that the user can call `then()` only when the file has
            //been downloaded entirely.

            return new Promise((resolve, reject) => {

                response.data.pipe(writer);
                let error = null;

                writer.on('error', err => {
                    error = err;
                    writer.close();
                    reject(err);
                });

                writer.on('close', () => {
                    if (!error) {
                    resolve(true);
                    }
                    //no need to call the reject here, as it will have been called in the
                    //'error' stream;
                });
            });
        });

        return createReturnData(fileName, directory, false)

    } catch (error) {
        return {
            status: false,
            messages: error
        }
    }
}

const deleteFile = async (fileName = '') => {

    try {

        if (fs.existsSync(uploadBase + fileName)) {
            await fs.unlinkSync(uploadBase + fileName)
        }
        
        return {
            status: true
        }
    } catch (error) {
        return {
            status: false
        }
    }

}

module.exports = {
    uploadFile,
    downloadFile,
    deleteFile
}