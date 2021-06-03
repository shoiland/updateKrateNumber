const scout = require("@scout_apm/scout-apm");
const express = require('express')
const getKlaviyoID = require('./utils/getKlaviyoID')
const updateKlaviyoProfile = require('./utils/updateKlaviyoProfile')
const getSubscription = require('./utils/getSubscription')
const getOrderCount = require('./utils/getOrderCount')


// The "main" function
async function start() {
    // Trigger the download and installation of the core-agent
    await scout.install({
      allowShutdown: true, // allow shutting down spawned scout-agent processes from this program
      monitor: true, // enable monitoring
      name: "klaviyoReChargeTool",
    });
  
    // Initialize your express application
    const app = express();
  
    // Enable the app-wide scout middleware
    app.use(scout.expressMiddleware());
  
    // Add other middleware and routes
    // app.use( ... )
    app.use(express.json())
    // app.get( ... )
    const port = process.env.PORT



    async function runKlaviyoUpdate(property, propertyStatus, email) {
        var klaviyoId = await getKlaviyoID(email)
        if(klaviyoId.length > 0) {
            updateKlaviyoProfile(klaviyoId, property, propertyStatus, email)
        } else {
            console.log('Can not find this person in the klaviyo list: ', email)
        }
        
    }

    /****************************** UPDATE KLAVIYO PROFILE WITH NEXT CHARGE DATE *******************************/
    //Will fire in the following cases: 
        //Frequency Change 
        //Cancelled Subscription (will set next charge date to null)
        //Reactivate Subscription (will set next charge date to next rebill)
    app.post('/subscriptionUpdated', async (req, res) => {
        runKlaviyoUpdate("AA-next-charge-date", req.body.subscription.next_charge_scheduled_at, req.body.subscription.email)
        return res.status(200).end()
    })

    /****************************** UPDATE KLAVIYO PROFILE INDICATING ACTIVE STATUS *******************************/
    //Will fire in the following cases: 
        //Reactivated sub and now has active subscription
    app.post('/activation', async (req, res) => {
        runKlaviyoUpdate("AA-ReCharge_Status", req.body.customer.status, req.body.customer.email)
        return res.status(200).end()
    })

    /****************************** UPDATE KLAVIYO PROFILE INDICATING INACTIVE STATUS *******************************/
    //Will fire in the following cases: 
        //Cancelled subs where they don't have any active subs remaining 
    app.post('/deactivation', async (req, res) => {
        runKlaviyoUpdate("AA-ReCharge_Status", req.body.customer.status, req.body.customer.email)
        return res.status(200).end()
    })

    /****************************** UPDATE KLAVIYO PROFILE WITH MOST RECENT CANCEL REASON *******************************/
    //Will fire in the following cases: 
        //Cancelled Subscription
    app.post('/cancellation', async (req, res) => {
        runKlaviyoUpdate("AA-cancel_reason", req.body.subscription.cancellation_reason, req.body.subscription.email)
        runKlaviyoUpdate("AA-cancel_date", req.body.subscription.cancelled_at, req.body.subscription.email)
        return res.status(200).end()
    })

    /****************************** UPDATE KLAVIYO PROFILE WITH NEXT CHARGE FOR SKIPS *******************************/
    //Will fire in the following cases: 
        //Skipped shipment
    app.post('/skipped', async (req, res) => {
        runKlaviyoUpdate("AA-next-charge-date", req.body.subscription.next_charge_scheduled_at, req.body.subscription.email)
        return res.status(200).end()
    })

    /****************************** UPDATE KLAVIYO PROFILE WITH NEXT CHARGE FOR SKIPS *******************************/
    //Will fire in the following cases: 
    //Skipped shipment
    app.post('/unskipped', async (req, res) => {
        runKlaviyoUpdate("AA-next-charge-date", req.body.subscription.next_charge_scheduled_at, req.body.subscription.email)
        return res.status(200).end()
    })
        
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
    app.post('/chargeUpdated', async (req, res) => {
        runKlaviyoUpdate("AA-next-charge-date", req.body.charge.scheduled_at, req.body.charge.email)
        return res.status(200).end()
    })

    /****************************** UPDATE KLAVIYO PROFILE WITH KRATE NUMBER *******************************/
    //order/processed webhook https://developer.rechargepayments.com/#webhooks-explained
    //Will fire in the following cases: 
        //Rebill goes thru and order is processed
    app.post('/updateKrateNumber', async (req, res) => {

        var orderCount = await getOrderCount(req.body.order.customer_id, req.body.order.line_items[0].subscription_id)
        var subscription = await getSubscription(req.body.order.line_items[0].subscription_id)

        runKlaviyoUpdate("AA-Krate-Number", orderCount.count + 1, req.body.order.email)
        runKlaviyoUpdate("AA-next-charge-date", subscription.subscription.next_charge_scheduled_at, req.body.order.email)
        return res.status(200).end()

    })

    app.listen(port, () => {
        console.log('server is up on port ' + port)
    })

  }
  
  // If this script is executed directly, run the start function
  if (require.main === module) { start(); } 








