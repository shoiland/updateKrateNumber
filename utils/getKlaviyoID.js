
const axios = require('axios')

const httpRequest = (baseURL, email, klaviyoToken, pushToken, method) => {

    return axios({
        method:method,
        url:baseURL,
        data: {
            "api_key": `${klaviyoToken}`, 
            "emails": email,
            "push_tokens": pushToken
        },
        headers: {
            "Accept": "*/*",
            "Content-Type": "application/json",
        }
    })
}



const getKlaviyoID = async (email) => {

    return new Promise( async (resolve, reject) => {

        try {

            var baseURL = 'https://a.klaviyo.com/api/v2/list/KXcuGm/subscribe'
            const klaviyoToken = process.env.KLAVIYOTOKEN
            const pushToken = process.env.PUSHTOKEN

            var responseObj = await httpRequest(baseURL, email, klaviyoToken, pushToken, 'get')
        
            if (responseObj.data.length === 0){
                reject(`This user has no email in Klaviyo ${email}`)
            }
            resolve(responseObj.data[0].id)

        } catch (e) {
            reject(e)
        }

    })

}

module.exports = getKlaviyoID