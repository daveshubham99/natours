const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text')

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email,
            this.firstname = user.name.split(' ')[0],
            this.url = url,
            this.from = 'Shubham Dave <daveshubham99@trial-3zxk54v2n91ljy6v.mlsender.net>'

    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                host: 'smtp.mailersend.net',
                port: process.env.MAILER_PORT,
                auth: {
                    user: process.env.MAILER_USERNAME,
                    pass: process.env.MAILER_PASS
                }
            });
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASS
            }
        })
    }

    async send(template, subject) {

        //1) rendering to pug template which will provide the html template from my email
        const html = pug.renderFile(
            `${__dirname}/../views/emails/${template}.pug`,
            {
                firstName: this.firstname,
                url: this.url,
                subject
            }
        )

        //2) defining all the parameteres require to send the email and converting htm to text using pacakage 
        const emailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.convert(html)

        }
        //3)actually sending the email
        await this.newTransport().sendMail(emailOptions)
    }

    async sendWelcome() {
        console.log("today is great day")
        await this.send('Welcome', 'Welcome to natours family')
    }
    async sendPasswordResetEmail() {
        console.log("today is great 2 day")
        await this.send('passwordReset', 'This is your password reset Link')
    }

}










