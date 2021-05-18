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




const getSubscriptions = async (customerId) => {

    try {

        var baseURL = `https://api.rechargeapps.com/subscriptions?customer_id=${customerId}`

        var response = await httpRequest(baseURL, 'get')
      
        var responseObj = {
            status: response.response.status, 
            subscriptionsArray: response.response.data.subscriptions

        }
        return responseObj

    } catch {
        console.log('this failed email')

    }
}

module.exports = getSubscriptions