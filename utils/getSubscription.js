const axios = require('axios')


const httpRequest = (baseURL, method) => {

    return axios({
        method:method,
        url:baseURL,
        data: {
            
        },
        headers: {
            "Accept": "*/*",
            "X-Recharge-Access-Token": process.env.RECHARGETOKEN
        }

    }).then(function(response){
        return {
            response
        }
    }).catch(function(error){
        return error
    })
}




const getSubscription = async (subId) => {

    try {

        var baseURL = `https://api.rechargeapps.com/subscriptions/${subId}`

        var response = await httpRequest(baseURL, 'get')
      
        var responseObj = {
            status: response.response.status, 
            subscription: response.response.data.subscription

        }
        return responseObj

    } catch {
        console.log('this failed email')

    }
}

module.exports = getSubscription