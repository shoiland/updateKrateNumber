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


async function runKlaviyoUpdate(property, propertyStatus, email) {
    var klaviyoId = await getKlaviyoID(email)
    if(klaviyoId.length > 0) {
        updateKlaviyoProfile(klaviyoId, property, propertyStatus, email)
    } else {
        console.log('Can not find this person in the klaviyo list: ', email)
    }
    
}

/****************************** UPDATE KLAVIYO PROFILE WITH NEXT CHARGE DATE *******************************/
//Using this to update next charge date when someone changes their frequency
app.post('/subscriptionUpdated', async (req, res) => {
    runKlaviyoUpdate("AA-next-charge-date", req.body.subscription.next_charge_scheduled_at, req.body.subscription.email)
    return res.status(200).end()
})

/****************************** UPDATE KLAVIYO PROFILE INDICATING ACTIVE STATUS *******************************/
//Runs for new customers and those who reactivate their subscription if they didn't have one before
app.post('/activation', async (req, res) => {
    runKlaviyoUpdate("AA-ReCharge_Status", req.body.customer.status, req.body.customer.email)
    return res.status(200).end()
})

/****************************** UPDATE KLAVIYO PROFILE INDICATING INACTIVE STATUS *******************************/
//Runs when a customer has cancelled and they dont' have a subscription remaining meaning their account is set to inactive
app.post('/deactivation', async (req, res) => {
    runKlaviyoUpdate("AA-ReCharge_Status", req.body.customer.status, req.body.customer.email)
    return res.status(200).end()
})

/****************************** UPDATE KLAVIYO PROFILE WITH MOST RECENT CANCEL REASON *******************************/
//Runs when a customer has cancelled their subscription
app.post('/cancellation', async (req, res) => {
    runKlaviyoUpdate("AA-cancel_reason", req.body.subscription.cancellation_reason, req.body.subscription.email)
    runKlaviyoUpdate("AA-cancel_date", req.body.subscription.cancelled_at, req.body.subscription.email)
    return res.status(200).end()
})

/****************************** UPDATE KLAVIYO PROFILE WITH NEXT CHARGE FOR SKIPS *******************************/
//Fires when someone skips a shipment and updates next charge date
app.post('/skipped', async (req, res) => {
    runKlaviyoUpdate("AA-next-charge-date", req.body.subscription.next_charge_scheduled_at, req.body.subscription.email)
    return res.status(200).end()
})

/****************************** FIRE FOR NEW SUBSCRIPTIONS AND SET NEXT CHARGE DATE *******************************/
app.post('/subscriptionCreated', async (req, res) => {
    runKlaviyoUpdate("AA-next-charge-date", req.body.subscription.next_charge_scheduled_at, req.body.subscription.email)
    return res.status(200).end()
})

/****************************** UPDATE KLAVIYO PROFILE WITH NEXT CHARGE DATE *******************************/
//Fires if customer service updates the users next charge date
app.post('/chargeUpdated', async (req, res) => {
    runKlaviyoUpdate("AA-next-charge-date", req.body.charge.scheduled_at, req.body.charge.email)
    return res.status(200).end()
})

/****************************** UPDATE KLAVIYO PROFILE WITH KRATE NUMBER *******************************/
//order/processed webhook https://developer.rechargepayments.com/#webhooks-explained
app.post('/updateKrateNumber', async (req, res) => {

    var subscriptions = await getSubscriptions(req.body.order.customer_id)
    var email = req.body.order.email 
    var klaviyoId = await getKlaviyoID(email)
    //Check and see if we received an error
    if(klaviyoId.length > 0){
        //Loop through the subscriptions for the length of number of subscriptions
        for(var i = 0; i < subscriptions.subscriptionsArray.length; i++) {
            var orderCount = await getOrderCount(rechargeCustomerId, subscriptions.subscriptionsArray[i].id)
            //For each subscription update the Klaviyo Profile with Subscription Number and Order number on that subscription
            updateKlaviyoProfile(klaviyoId, `AA-Subscription-${i + 1}-Krate Number`, orderCount.count + 1, email)
            updateKlaviyoProfile(klaviyoId, `AA-Subscription-${i + 1}-Krate Status`, subscriptions.subscriptionsArray[i].status, email)
            updateKlaviyoProfile(klaviyoId, `AA-Subscription-${i + 1}-Next Charge Date`, subscriptions.subscriptionsArray[i].next_charge_scheduled_at, email)
        }
    } else {
        console.log('Can not find this person email in a list in klaviyo: ', email)
    }
    //Return 200 back to webhook letting them know we received it
    return res.status(200).end()




    runKlaviyoUpdate("AA-next-charge-date", req.body.charge.scheduled_at, req.body.charge.email)
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
