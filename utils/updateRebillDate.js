const axios = require('axios')
const sendErrorEmail = require('../utils/email')

const httpRequest = (baseURL, newChargeDate, reChargeToken, method) => {
    return axios({
        method: method, 
        url: baseURL, 
        data: {
            "date": `${newChargeDate}`,
        }, 
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Recharge-Access-Token": reChargeToken
        }
    }).then(function(response){
        return {
            status: response.status, 
            email: response.data.subscription.email, 
            newDate: response.data.subscription.next_charge_scheduled_at, 
            updatedDate: response.data.subscription.updated_at, 
            subID: response.data.subscription.id
        }
    }).catch(function(error){

        if(error.response){
            return {
                data: error.response.data, 
                status: error.response.status, 
                headers: error.response.headers
            }
        } else if (error.request) {
            return {
                error: error.request
            }
        } else {
            
            return {error: error.message}
                
        
        }
      
    })

}

const updateRebillDate = async (subscription) => {

    

    try {

        console.log('Here is the subscription object', subscription)

        var name = subscription.email

        var baseURL = `https://api.rechargeapps.com/subscriptions/${subscription.id}/set_next_charge_date`
        const reChargeToken = process.env.RECHARGETOKEN
        
        var created = subscription.created_at
        if(!created){
            console.log('weird', subscription)
        }
        var dateArray = created.split('-')
        console.log("Here is the date array", dateArray)
        var createdDay = Number(dateArray[2].substring(0,2))
        var createdMonth = Number(dateArray[1])
        var createdTime = Number(dateArray[2].substring(3,5))
        console.log("Here are the variables", createdDay, createdMonth, createdTime); 
    
        //This is the cutoff time we set.  So anyone who signs up before the 20th at 9:00am would get that months Krate and their subscription would be rebilled on next rebill
        //Those that signup after we need to push their signup to nextmonth + 1
        //Need to set the time to 10 based on EST
        var mainChargeDay = 3
        var cutOffDay = 20
        var cutOffTime = 10

        console.log("Created time: ", createdTime, "Cutoff time: ", cutOffTime);
    
        var nextChargeScheduled = subscription.next_charge_scheduled_at
        var nextChargeArray = nextChargeScheduled.split('-')
        var nextChargeMonth = Number(nextChargeArray[1])
        var nextChargeYear = Number(nextChargeArray[0])
      
        var newChargeDate = null
    
        const zeroPadding = (num) => {
            num = num.toString()
            if(num.length === 2){
                return num
            }
    
            num = "0" + num
            return num
        
        }

        console.log("Next Charge Month", nextChargeMonth)
        console.log(createdDay === cutOffDay)
        console.log(createdDay)
        console.log(cutOffDay)



        //Check the edge case when it is the 20th of the month and past the cutoff time of 10am 
    
        if(createdDay === cutOffDay && createdTime >= cutOffTime){
            newChargeDate = `${nextChargeYear}-${zeroPadding(createdMonth + 2)}-${zeroPadding(mainChargeDay)}`     
        } else if (createdDay > cutOffDay) {
            newChargeDate = `${nextChargeYear}-${zeroPadding(createdMonth + 2)}-${zeroPadding(mainChargeDay)}`   
        } else {   
            newChargeDate = `${nextChargeYear}-${zeroPadding(nextChargeMonth)}-${zeroPadding(mainChargeDay)}`
        }

        console.log("New charge date: ", newChargeDate); 
    
        var responseObj = await httpRequest(baseURL, newChargeDate, reChargeToken, 'post')

        //Firing once more incase received 409 error
        if(responseObj.status === 409){
            console.log('trying again')
            responseObjtwo = await httpRequest(baseURL, newChargeDate, reChargeToken, 'post')
            return responseObjtwo
            
        } else if(responseObj.status === 400 || responseObj.status === 404){
            console.log("400 or 404 status: ", responseObj);
            sendErrorEmail(responseObj, name); 
            return responseObj;

        } else {
            return responseObj
        }

    } catch (e) {

        console.log('102', e)

        return e

    }
}


module.exports = updateRebillDate; 
