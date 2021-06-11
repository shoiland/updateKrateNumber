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

    })
}




const getOrderCount = async (customerId, subscriptionId) => {

    return new Promise( async (resolve, reject) => {

        try {

            var baseURL = `https://api.rechargeapps.com/orders/count?customer_id=${customerId}&subscription_id=${subscriptionId}`
    
            var response = await httpRequest(baseURL, 'get')

            resolve({
                status: response.status, 
                count: response.data.count
            })
    
        } catch(e) {

            reject(e)

        }
    })
}

module.exports = getOrderCount