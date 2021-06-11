const axios = require('axios')


const httpRequest = (baseURL, method) => {

    return axios({
        method:method,
        url:baseURL,
        headers: {
            "Accept": "*/*",         
        }

    })
}




const updateKlaviyoProfile = async (klaviyoId, property, status, email) => {

    return new Promise( async (resolve, reject) => {

        try {

            const klaviyoToken = process.env.KLAVIYOTOKEN
            var baseURL = `https://a.klaviyo.com/api/v1/person/${klaviyoId}?api_key=${klaviyoToken}&${property}=${status}`
    
            var klaviyoDetails = await httpRequest(baseURL, 'put')
            var newproperty = property
            resolve(
                {
                [newproperty]: klaviyoDetails.data[property],
                email: klaviyoDetails.data.email
                }
            )
    
        } catch (e) {
            reject(e)
        }

    })
}

module.exports = updateKlaviyoProfile