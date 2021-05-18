const axios = require('axios')


const httpRequest = (baseURL, method, email, property) => {

    return axios({
        method:method,
        url:baseURL,
        headers: {
            "Accept": "*/*",         
        }

    }).then(function(response){
        
        var newproperty = property

        var responseObj = {
            [newproperty]: response.data[property],
            email: response.data.email
        }
        console.log('The Klaviyo profile was updated with the following: ',responseObj)

        if(response.status !== 200)
        {
            console.log('The httpRequest to Klaviyo failed for this person: ', email)
            return
        }
        return
    }).catch(function(error){
        console.log(error)
        console.log('Received an error in the httpRequest in updating the Klaviyo profile for this email: ', email)

        return
    })
}




const updateKlaviyoProfile = async (klaviyoId, property, status, email) => {

    try {

        const klaviyoToken = process.env.KLAVIYOTOKEN
        var baseURL = `https://a.klaviyo.com/api/v1/person/${klaviyoId}?api_key=${klaviyoToken}&${property}=${status}`

        httpRequest(baseURL, 'put', email, property)

    } catch {
        console.log('Updating the Klaviyo Profile failed for this KlaviyoID: ', klaviyoId)

    }
}

module.exports = updateKlaviyoProfile