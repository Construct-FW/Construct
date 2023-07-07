const nodemailer = require("nodemailer");
const mg = require('nodemailer-mailgun-transport');
const sgMail = require('@sendgrid/mail')
const fs = require('fs').promises;
let transporter = null;
let testAccount = null;
const config = require('../../../../app/config');

if(config.email_provider == 'sendgrid') {
    sgMail.setApiKey(config.sendgrid.apikey);
}

// async..await is not allowed in global scope, must use a wrapper
const createMailer = async () => {

    if (config.email_provider == 'default') {

        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });

    } else if(config.email_provider == 'mailgun') {

        const auth = {
            auth: {
                api_key: config.mailgun.apikey,
                domain: config.mailgun.domain
            }
        }

        transporter = nodemailer.createTransport(mg(auth));

    } else if(config.email_provider == 'sendgrid') {
        transporter = 'sendgrid';
    }

}

const sendEmail = async (toEmail = "", subject = "", type = "verify", extraParams = {}, hostname = '') => {
    
    if (transporter != null && toEmail != "") {

        let hostImage = config.isDevelopment ? 'http://' + hostname + '/assets/emails/' : 'https://' + config.domain + '/assets/emails/';

        let getTemplate = await fs.readFile(process.cwd() + '/app/emails/' + type + '.html', 'utf8');
        getTemplate = getTemplate.replaceAll("{%site_logo%}", config.siteInfo.logo);
        getTemplate = getTemplate.replace("{%site_name%}", config.siteInfo.name);
        getTemplate = getTemplate.replaceAll("{%site_domain%}", config.domain);
        getTemplate = getTemplate.replaceAll("{%site_favicon%}", config.siteInfo.favicon);
        getTemplate = getTemplate.replaceAll("{%site_cdn%}", hostImage);

        if (Object.keys(extraParams).length > 0) {
            for (let eP = 0; eP < Object.keys(extraParams).length; eP++) {
                let keyExtra = Object.keys(extraParams)[eP];
                let valueExtra = Object.values(extraParams)[eP];

                getTemplate = getTemplate.replaceAll("{%" + keyExtra + "%}", valueExtra);
            }
        }

        if(config.email_provider == 'sendgrid') {
            return await sendgridEmail(toEmail, subject, getTemplate);
        } else {
            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: config.siteInfo.email || "noreply@" + config.siteInfo.domain,
                to: toEmail,
                subject: config.siteInfo.name + '-' + subject,
                html: getTemplate, // html body
            });


            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            return info;
        }
    }

    return false
}

const sendgridEmail = async (toEmail = '', subject = '', template = '') => {

    const msg = {
        to: toEmail, // Change to your recipient
        from: config.sendgrid.from_email, // Change to your verified sender
        subject: config.siteInfo.name + ' - ' + subject,
        html: template,
    }

    sgMail.send(msg).catch((error) => {
        console.error(error.response.body.errors)
    })


    return true
}

module.exports = {
    createMailer,
    sendEmail
}