const resizer = require('node-image-resizer');
const basePath = process.cwd() + '/public/uploads/'

let resizerOpts = {
    all: {
        path: basePath + 'thumbnails/',
        quality: 80
    },
    versions: [{
        prefix: '',
        width: 800,
        height: 800
    }]
}

const resize = async (filePath, resizeSetup = false, quality = 80, directory = false) => {

    if(directory) {
        resizerOpts.all.path = basePath + directory + '/'
    }

    const resizeOptsAll = JSON.parse(JSON.stringify(resizerOpts))
    resizeOptsAll.all.quality = quality

    if (resizeSetup) {
        resizeOptsAll.versions = resizeSetup.reduce((o,n) => {
            const version = Object.assign({}, resizeOptsAll.versions[0], n)
            version.prefix = 'resize_' + version.width + 'x' + version.height + '_'
            o.push(version)
            return o
        }, [])
    }

    try {
        const resizedImages = await resizer(basePath + filePath, resizeOptsAll);

        return {
            status: true,
            files: resizedImages.reduce((o,n,k) => {
                o.push({
                    width: resizeOptsAll.versions[k].width,
                    height: resizeOptsAll.versions[k].height,
                    fileUrl: n.replace(basePath, '')
                })
                return o
            },[])
        };
    } catch (error) {
        return {
            status: false
        }
    }
}

module.exports = {
    resize
}