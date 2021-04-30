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
        return {
            status: response.status,
            email: response.data[0].email,
            klaviyoId: response.data[0].id

        }
    }).catch(function(error){
        return error
    })
}

module.exports = httpRequest