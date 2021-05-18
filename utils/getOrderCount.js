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




const getOrderCount = async (customerId, subscriptionId) => {

    try {

        var baseURL = `https://api.rechargeapps.com/orders/count?customer_id=${customerId}&subscription_id=${subscriptionId}`

        var response = await httpRequest(baseURL, 'get')
      
        var responseObj = {
            status: response.response.status, 
            count: response.response.data.count

        }
        return responseObj

    } catch {
        console.log('this failed email')

    }
}

module.exports = getOrderCount