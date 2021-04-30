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




const getReChargeCustomerObj = async (customerId) => {

    try {

        var baseURL = `https://api.rechargeapps.com/customers/${customerId}`

        var response = await httpRequest(baseURL, 'get')
      
        var responseObj = {
            status: response.response.status, 
            number_active_subs: response.response.data.customer.number_active_subscriptions

        }
        return responseObj

    } catch {
        console.log('this failed email')

    }
}

module.exports = getReChargeCustomerObj