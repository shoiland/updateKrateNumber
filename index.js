const express = require('express')
const getKlaviyoID = require('./utils/getKlaviyoID')
const updateKlaviyoProfile = require('./utils/updateKlaviyoProfile')
const getSubscription = require('./utils/getSubscription')
const getOrderCount = require('./utils/getOrderCount')


const app = express();

const port = process.env.PORT

app.use(express.json())

async function runKlaviyoUpdate(property, propertyStatus, email) {
    return new Promise(async (resolve, reject) => {
        try {
            var klaviyoId = await getKlaviyoID(email)
            if(klaviyoId.length > 0) {
                resolve(updateKlaviyoProfile(klaviyoId, property, propertyStatus, email))
            } 
            reject(`This user is not in a Klaviyo list ${email}`)
        } catch (e) {
            reject(e)
        }
    })    
}

app.post('/updateKrateNumber2', async (req, res) => {
    const customerId = req.body.order.customer_id
    const subId = req.body.order.line_items[0].subscription_id
    const email = req.body.order.email
    
    try {
        var orderCount = await getOrderCount(customerId, subId)
        var count = orderCount.count

        var subscription = await getSubscription(subId)
        var nextCharge = subscription.subscription.next_charge_scheduled_at

        var responseKlaviyoCall1 = await runKlaviyoUpdate("AA-Krate-Number", count + 1, email)
        var responseKlaviyoCall2 = await runKlaviyoUpdate("AA-next-charge-date", nextCharge, email)

        console.log(responseKlaviyoCall1)
        console.log(responseKlaviyoCall2)
    
        return res.status(200).send()

    } catch (e) {
        console.log(`Here is the main catch error for this user: ${email}`, e)
        return res.status(400).send()
    }
})

app.listen(port, () => {
    console.log('server is up on port ' + port)
})



// /****************************** UPDATE KLAVIYO PROFILE WITH NEXT CHARGE DATE *******************************/
// //Will fire in the following cases: 
//     //Frequency Change 
//     //Cancelled Subscription (will set next charge date to null)
//     //Reactivate Subscription (will set next charge date to next rebill)
// app.post('/subscriptionUpdated', async (req, res) => {
//     runKlaviyoUpdate("AA-next-charge-date", req.body.subscription.next_charge_scheduled_at, req.body.subscription.email)
//     return res.status(200).end()
// })

// /****************************** UPDATE KLAVIYO PROFILE INDICATING ACTIVE STATUS *******************************/
// //Will fire in the following cases: 
//     //Reactivated sub and now has active subscription
// app.post('/activation', async (req, res) => {
//     runKlaviyoUpdate("AA-ReCharge_Status", req.body.customer.status, req.body.customer.email)
//     return res.status(200).end()
// })

// /****************************** UPDATE KLAVIYO PROFILE INDICATING INACTIVE STATUS *******************************/
// //Will fire in the following cases: 
//     //Cancelled subs where they don't have any active subs remaining 
// app.post('/deactivation', async (req, res) => {
//     runKlaviyoUpdate("AA-ReCharge_Status", req.body.customer.status, req.body.customer.email)
//     return res.status(200).end()
// })

// /****************************** UPDATE KLAVIYO PROFILE WITH MOST RECENT CANCEL REASON *******************************/
// //Will fire in the following cases: 
//     //Cancelled Subscription
// app.post('/cancellation', async (req, res) => {
//     runKlaviyoUpdate("AA-cancel_reason", req.body.subscription.cancellation_reason, req.body.subscription.email)
//     runKlaviyoUpdate("AA-cancel_date", req.body.subscription.cancelled_at, req.body.subscription.email)
//     return res.status(200).end()
// })

// /****************************** UPDATE KLAVIYO PROFILE WITH NEXT CHARGE FOR SKIPS *******************************/
// //Will fire in the following cases: 
//     //Skipped shipment
// app.post('/skipped', async (req, res) => {
//     runKlaviyoUpdate("AA-next-charge-date", req.body.subscription.next_charge_scheduled_at, req.body.subscription.email)
//     return res.status(200).end()
// })

// /****************************** UPDATE KLAVIYO PROFILE WITH NEXT CHARGE FOR SKIPS *******************************/
// //Will fire in the following cases: 
// //Skipped shipment
// app.post('/unskipped', async (req, res) => {
//     runKlaviyoUpdate("AA-next-charge-date", req.body.subscription.next_charge_scheduled_at, req.body.subscription.email)
//     return res.status(200).end()
// })
    
/****************************** FIRE FOR NEW SUBSCRIPTIONS AND SET NEXT CHARGE DATE *******************************/
//Will fire in the following cases: 
    //Subscription is created
    //Shouldn't need to run because the Heroku app already has subscription created webhook 
    //It will then change the next charge date which will trigger the subscription/updated which will add it to klaviyo
// app.post('/subscriptionCreated', async (req, res) => {
//     console.log('sub created: ', req.body.subscription.email)
//     runKlaviyoUpdate("AA-next-charge-date", req.body.subscription.next_charge_scheduled_at, req.body.subscription.email)
//     return res.status(200).end()
// })

/****************************** UPDATE KLAVIYO PROFILE WITH NEXT CHARGE DATE *******************************/
//Will fire in the following cases: 
    //CS updates next charge date
// app.post('/chargeUpdated', async (req, res) => {
//     runKlaviyoUpdate("AA-next-charge-date", req.body.charge.scheduled_at, req.body.charge.email)
//     return res.status(200).end()
// })

/****************************** UPDATE KLAVIYO PROFILE WITH KRATE NUMBER *******************************/
//order/processed webhook https://developer.rechargepayments.com/#webhooks-explained
//Will fire in the following cases: 
    //Rebill goes thru and order is processed








