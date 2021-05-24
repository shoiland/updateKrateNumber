const express = require('express')
const getKlaviyoID = require('./utils/getKlaviyoID')
const updateKlaviyoProfile = require('./utils/updateKlaviyoProfile')
const getReChargeCustomerObj = require('./utils/getReChargeCustomerObj')
const getSubscriptions = require('./utils/getSubscriptions')
const updateRebillDate = require('./utils/updateRebillDate')
const getOrderCount = require('./utils/getOrderCount')
const sendErrorEmail = require('./utils/email')

const app = express()

const port = process.env.PORT

app.use(express.json())


async function runKlaviyoUpdate(property, req) {
    var propertyStatus = req.body.customer.status
    var email = req.body.customer.email
    var klaviyoId = await getKlaviyoID(email)
    if(klaviyoId.length > 0) {
        updateKlaviyoProfile(klaviyoId, property, propertyStatus, email)
    } else {
        console.log('Can not find this person in the klaviyo list: ', email)
    }
    return res.status(200).end()
}





/****************************** UPDATE KLAVIYO PROFILE INDICATING ACTIVE STATUS *******************************/
//Runs for new customers and those who reactivate their subscription if they didn't have one before
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
//Runs when a customer has cancelled and they dont' have a subscription remaining meaning their account is set to inactive
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
//Runs when a customer has cancelled their subscription
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

/****************************** UPDATE KLAVIYO PROFILE WITH NEXT CHARGE DATE *******************************/
//Using this to update next charge date when someone changes their frequency
app.post('/subscriptionUpdated', async (req, res) => {
    //Set the property you want to update in klaviyo.  If it doesn't exist it will be created
    var property = "AA-next-charge-date"
    //Get the property status from ReCharge API -- you can see the payload example there https://developer.rechargepayments.com/v1?shell#subscription
    var propertyStatus = req.body.subscription.next_charge_scheduled_at
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
    } else {
        console.log('Can not find this person email in a list in klaviyo: ', email)
    }
    //Return 200 back to webhook letting them know we received it
    return res.status(200).end()
})


/****************************** UPDATE KLAVIYO PROFILE WITH KRATE NUMBER *******************************/
//Update how many Krates they have received. There is a webhook created using PostMan to hitup this endpoint for order/processed -- when this runs then we will update the klaviyo profile for this customer incrementing the shipment by one 
app.post('/updateKrateNumber', async (req, res) => {
    //Get the subscription object from ReCharge 
    var email = req.body.order.email 
    var rechargeCustomerId = req.body.order.customer_id 
    var subscriptions = await getSubscriptions(rechargeCustomerId)
    //Get KlaviyoID and wait for response to store it in a variable 
    console.log(subscriptions)
    //var newChargeDate = subscriptions.subscriptionsArray[0]
     var klaviyoId = await getKlaviyoID(email)
    //Check and see if we received an error
    if(klaviyoId.length > 0){
        //Loop through the subscriptions for the length of number of subscriptions
        for(var i = 0; i < subscriptions.subscriptionsArray.length; i++) {
            var subscriptionId = subscriptions.subscriptionsArray[i].id
            var subscriptionStatus = subscriptions.subscriptionsArray[i].status
            var subscriptionNextCharge = subscriptions.subscriptionsArray[i].next_charge_scheduled_at
            var property = `AA-Subscription-${i + 1}-Krate Number`
            var propertyTwo = `AA-Subscription-${i + 1}-Krate Status`
            var propertyThree = `AA-Subscription-${i + 1}-Next Charge Date`
            var orderCount = await getOrderCount(rechargeCustomerId, subscriptionId)
            //For each subscription update the Klaviyo Profile with Subscription Number and Order number on that subscription
            updateKlaviyoProfile(klaviyoId, property, orderCount.count + 1, email)
            updateKlaviyoProfile(klaviyoId, propertyTwo, subscriptionStatus, email)
            updateKlaviyoProfile(klaviyoId, propertyThree, subscriptionNextCharge, email)
        }
    } else {
        console.log('Can not find this person email in a list in klaviyo: ', email)
    }
    //Return 200 back to webhook letting them know we received it
    return res.status(200).end()
})

/****************************** UPDATE KLAVIYO PROFILE WITH NEXT CHARGE FOR SKIPS *******************************/
//Fires when someone skips a shipment and updates next charge date
app.post('/skipped', async (req, res) => {
    //Set the property you want to update in klaviyo.  If it doesn't exist it will be created
    var property = "AA-next-charge-date"
    //Get the property status from ReCharge API -- you can see the payload example there https://developer.rechargepayments.com/v1?shell#subscription
    var propertyStatus = req.body.subscription.next_charge_scheduled_at
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
    } else {
        console.log('Can not find this person email in a list in klaviyo: ', email)
    }
    //Return 200 back to webhook letting them know we received it
    return res.status(200).end()

})

/****************************** FIRE FOR NEW SUBSCRIPTIONS AND SET NEXT CHARGE DATE *******************************/
app.post('/subscriptionCreated', async (req, res) => {
    console.log('created')
    //Set the property you want to update in klaviyo.  If it doesn't exist it will be created
    var property = "AA-next-charge-date"
    //Get the property status from ReCharge API -- you can see the payload example there https://developer.rechargepayments.com/v1?shell#subscription
    var propertyStatus = req.body.subscription.next_charge_scheduled_at
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
    } else {
        console.log('Can not find this person email in a list in klaviyo: ', email)
    }
    //Return 200 back to webhook letting them know we received it
    return res.status(200).end()
})

/****************************** UPDATE KLAVIYO PROFILE WITH NEXT CHARGE DATE *******************************/
//Fires if customer service updates the users next charge date
app.post('/chargeUpdated', async (req, res) => {
    //Set the property you want to update in klaviyo.  If it doesn't exist it will be created
    var property = "AA-next-charge-date"
    //Get the property status from ReCharge API -- you can see the payload example there https://developer.rechargepayments.com/v1?shell#subscription
    var propertyStatus = req.body.charge.scheduled_at
    //Get the email from the request body and status 
    var email = req.body.charge.email
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

/****************************** UPDATE KLAVIYO PROFILE WITH KRATE NUMBER *******************************/

//Need to indicate on their profile the Krate number they are at 
//There is a webhook created using PostMan to hitup this endpoint for order/processed -- when this runs then we will update the klaviyo profile for this customer incrementing the shipment by one 


// app.post('changeNextCharge', (req, res) => {

//     if(Object.keys(req.body).length === 0){
//         sendErrorEmail(`This person doesn't have a payload in their request.  The webhook should try again as ReCharge is given back a 404`)
//         return res.status(404).end()
//     }
//     //Update the next charge.  This will run async to give back status 200 to the webhook.  This is important so the webhook doesn't fire again
//     //Our error handling will be in the updaterebilldate function
//     //This will run through the event handler in the stack even though program has finished because it is async
//     updateRebillDate(req.body.subscription).then(function(result){
//         //If we get anything other than a 200 send an email
//         if(result.status !== 200){
//             //console.log('send email')
//             console.log('status error')
//             sendErrorEmail(JSON.stringify(result))
//         }
//         console.log(result)
//     }).catch(function(e){
//         //If we get an error send email
//         console.log('console logging error', e)
//         sendErrorEmail(e)
//     })

//     //console.log('printing before result from above function')
//     //Returning 200 back to the webhook and ending the request
//     return res.status(200).end()
// })

app.listen(port, () => {
    console.log('server is up on port ' + port)
})
