const axios = require('axios')


const httpRequest = (baseURL, method) => {

    return axios({
        method:method,
        url:baseURL,
        data: {
            
        },
        headers: {
            "Accept": "*/*",
            
        }

    }).then(function(response){
        return {
            response
        }
    }).catch(function(error){
        return error
    })
}




const updateKlaviyoProfile = async (result, property, status) => {

    try {

        const klaviyoToken = process.env.KLAVIYOTOKEN
        var baseURL = `https://a.klaviyo.com/api/v1/person/${result.klaviyoId}?api_key=${klaviyoToken}&${property}=${status}`

        var response = await httpRequest(baseURL, 'put')
        var responseObj = {
            status: response.response.status, 
            ReCharge_Status: response.response.data['AA-ReCharge_Status'],
            Number_Subs: response.response.data['AA-number_active_subscriptions']
        }
        //console.log(responseObj)
        return responseObj
        

    } catch {
        console.log('this failed email')

    }
}

module.exports = updateKlaviyoProfile