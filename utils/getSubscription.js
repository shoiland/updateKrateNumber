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




const getSubscription = async (subId) => {

    return new Promise( async (resolve, reject) => {
        try {

            var baseURL = `https://api.rechargeapps.com/subscriptions/${subId}`
    
            var response = await httpRequest(baseURL, 'get')

            resolve({
                status: response.status, 
                subscription: response.data.subscription
    
            })
    
        } catch (e) {
            reject(e)
        }

    })

    
}

module.exports = getSubscription