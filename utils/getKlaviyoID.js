
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

    }).then(function(response){
        //console.log(response.data)
        return {
            status: response.status,
            email: response.data[0].email,
            klaviyoId: response.data[0].id

        }
    }).catch(function(error){
        return error
    })
}



const getKlaviyoID = async (email) => {

    try {

        var baseURL = 'https://a.klaviyo.com/api/v2/list/KXcuGm/subscribe'
        const klaviyoToken = process.env.KLAVIYOTOKEN
        const pushToken = process.env.PUSHTOKEN

        var responseObj = await httpRequest(baseURL, email, klaviyoToken, pushToken, 'get')
        return responseObj

    } catch {
        //console.log('this failed email')

    }
}

module.exports = getKlaviyoID