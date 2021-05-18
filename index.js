const express = require('express')
const getKlaviyoID = require('./utils/getKlaviyoID')
const updateKlaviyoProfile = require('./utils/updateKlaviyoProfile')
const getReChargeCustomerObj = require('./utils/getReChargeCustomerObj')
const getSubscriptions = require('./utils/getSubscriptions')
const getOrderCount = require('./utils/getOrderCount')
const app = express()

const port = process.env.PORT


app.use(express.json())


/****************************** UPDATE KLAVIYO PROFILE INDICATING ACTIVE STATUS *******************************/

//Runs for new customers and those who reactivate their subscription if they didn't have one before
//There is a webhook created using PostMan to hitup this endpoint for customer/activated
//Customer activated will fire when a subscription is added for this customer who didn't have an active subscription prior to that moment 
app.post('/activation', async (req, res) => {

    //Set the property you want to update in klaviyo.  If it doesn't exist it will be created
    var property = "AA-ReCharge_Status"
    //Get the property status from ReCharge API -- you can see the payload example there https://developer.rechargepayments.com/v1?shell#subscription
    var propertyStatus = req.body.customer.status

    //Get the email from the request body and status 
    var email = req.body.customer.email
  
    //Get KlaviyoID and wait for response to store it in a variable 
    var klaviyoId = await getKlaviyoID(email)

    //Check and see if we received an error
    if(klaviyoId.length > 0){
        //Change the property on their profile to indicate they have an active subscription 
        //Pass in the id, property you want to update, the field to update it to, and the email of the customer
        //This is an async function and doesn't return anything
        updateKlaviyoProfile(klaviyoId, property, propertyStatus, email)

    } else {
        console.log('Can not find this person email in a list in klaviyo: ', email)
    }

    //Return 200 back to webhook letting them know we received it
    return res.status(200).end()

})


/****************************** UPDATE KLAVIYO PROFILE INDICATING INACTIVE STATUS *******************************/

//Runs when a customer has cancelled and they dont' have a subscription remaining
//There is a webhook created using PostMan to hitup this endpoint for customer/activated
//Customer activated will fire when a subscription is added for this customer who didn't have an active subscription prior to that moment 
app.post('/deactivation', async (req, res) => {

    //Set the property you want to update in klaviyo.  If it doesn't exist it will be created
    var property = "AA-ReCharge_Status"
    //Get the property status from ReCharge API -- you can see the payload example there https://developer.rechargepayments.com/v1?shell#subscription
    var propertyStatus = req.body.customer.status

    //Get the email from the request body and status 
    var email = req.body.customer.email
  
    //Get KlaviyoID and wait for response to store it in a variable 
    var klaviyoId = await getKlaviyoID(email)

    //Check and see if we received an error
    if(klaviyoId.length > 0){
        //Change the property on their profile to indicate they have an active subscription 
        //Pass in the id, property you want to update, the field to update it to, and the email of the customer
        //This is an async function and doesn't return anything
        updateKlaviyoProfile(klaviyoId, property, propertyStatus, email)

    } else {
        console.log('Can not find this person email in a list in klaviyo: ', email)
    }

    //Return 200 back to webhook letting them know we received it
    return res.status(200).end()

})

/****************************** UPDATE KLAVIYO PROFILE WITH MOST RECENT CANCEL REASON *******************************/

//Runs when a customer has cancelled and they dont' have a subscription remaining
//There is a webhook created using PostMan to hitup this endpoint for customer/activated
//Customer activated will fire when a subscription is added for this customer who didn't have an active subscription prior to that moment 
app.post('/cancellation', async (req, res) => {

    //Set the property you want to update in klaviyo.  If it doesn't exist it will be created
    var property = "AA-cancel_reason"
    var propertyTwo = "AA-cancel_date"
    //Get the property status from ReCharge API -- you can see the payload example there https://developer.rechargepayments.com/v1?shell#subscription
    var propertyStatus = req.body.subscription.cancellation_reason
    var propertyTwoStatus = req.body.subscription.cancelled_at

    //Get the email from the request body and status 
    var email = req.body.subscription.email
  
    //Get KlaviyoID and wait for response to store it in a variable 
    var klaviyoId = await getKlaviyoID(email)

    //Check and see if we received an error
    if(klaviyoId.length > 0){
        //Change the property on their profile to indicate they have an active subscription 
        //Pass in the id, property you want to update, the field to update it to, and the email of the customer
        //This is an async function and doesn't return anything
        updateKlaviyoProfile(klaviyoId, property, propertyStatus, email)
        updateKlaviyoProfile(klaviyoId, propertyTwo, propertyTwoStatus, email)

    } else {
        console.log('Can not find this person email in a list in klaviyo: ', email)
    }

    //Return 200 back to webhook letting them know we received it
    return res.status(200).end()

})

/****************************** UPDATE KLAVIYO PROFILE WITH KRATE NUMBER *******************************/

//Need to indicate on their profile the Krate number they are at 
//There is a webhook created using PostMan to hitup this endpoint for order/processed -- when this runs then we will update the klaviyo profile for this customer incrementing the shipment by one 

app.post('/updateKrateNumber', async (req, res) => {

    //Get the subscription object from ReCharge 
    var email = req.body.order.email 
    var rechargeCustomerId = req.body.order.customer_id 
    var subscriptions = await getSubscriptions(rechargeCustomerId)

    //Get KlaviyoID and wait for response to store it in a variable 
     var klaviyoId = await getKlaviyoID(email)

    //Check and see if we received an error
    if(klaviyoId.length > 0){

        //Loop through the subscriptions for the length of number of subscriptions
        for(var i = 0; i < subscriptions.subscriptionsArray.length; i++) {
            var subscriptionId = subscriptions.subscriptionsArray[i].id
            var subscriptionStatus = subscriptions.subscriptionsArray[i].status
            var property = `AA-Subscription-${i + 1}-Krate Number`
            var propertyTwo = `AA-Subscription-${i + 1}-Krate Status`
            var orderCount = await getOrderCount(rechargeCustomerId, subscriptionId)
            
            //For each subscription update the Klaviyo Profile with Subscription Number and Order number on that subscription
            updateKlaviyoProfile(klaviyoId, property, orderCount.count + 1, email)
            updateKlaviyoProfile(klaviyoId, propertyTwo, subscriptionStatus, email)
        }

    } else {
        console.log('Can not find this person email in a list in klaviyo: ', email)
    }

    //Return 200 back to webhook letting them know we received it
    return res.status(200).end()

})


app.listen(port, () => {
    console.log('server is up on port ' + port)
})