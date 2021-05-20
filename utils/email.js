const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendErrorEmail = (error, email) => {
    sgMail.send({
        to: 'scott@ketokrate.com',
        from: 'scott.hoiland87@gmail.com',
        subject: `Error with updating next charge`,
        text: `The email of this person is: ${email}. Here is your error: ${error}`
    })
}



module.exports = sendErrorEmail


