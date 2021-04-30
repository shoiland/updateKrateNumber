const express = require('express')
const getKlaviyoID = require('./utils/getKlaviyoID')
const updateKlaviyoProfile = require('./utils/updateKlaviyoProfile')
const getReChargeCustomerObj = require('./utils/getReChargeCustomerObj')
const app = express()

const port = process.env.PORT


app.use(express.json())

//Will fire when a subscription is cancelled by the user
app.post('/cancelledSub', (req, res) => {

    //The request is a subscription object. What this object looks like can be found here: https://ketokrate.atlassian.net/wiki/spaces/BL/pages/1405583361/How+Klaviyo+is+updated+with+API
    //This end point doesn't seem to always fire before the customer deactivated endpoint 

    //console.log('cancelledsub: ', req.body)

    var cancelReason = req.body.subscription.cancellation_reason
    var cancelReasonComments = req.body.subscription.cancellation_reason_comments
    var email = req.body.subscription.email 
    var customerID = req.body.subscription.customer_id

    //Get the new number of actives and update Klaviyo profile 
    getReChargeCustomerObj(customerID).then(function(result){
        var numberActiveSubs = result.number_active_subs
        var property = "AA-number_active_subscriptions"
        getKlaviyoID(email).then(function(result){
    
            updateKlaviyoProfile(result, property, numberActiveSubs)
            updateKlaviyoProfile(result, "AA-cancel_reason", cancelReason)
            updateKlaviyoProfile(result, "AA-cancel_reason_comments", cancelReasonComments)
        })

    }).catch(function(e){
        console.log('houston, we have a problem', e)

    })

    res.send('Ok')
    return res.status(200).end()
})

app.post('/activatedSub', (req, res) => {

    //console.log('activatedsub: ', req.body)

    var email = req.body.subscription.email 
    var customerID = req.body.subscription.customer_id

    //Get the new number of actives and update Klaviyo profile 
    getReChargeCustomerObj(customerID).then(function(result){
        var numberActiveSubs = result.number_active_subs
        var property = "AA-number_active_subscriptions"
        getKlaviyoID(email).then(function(result){

            updateKlaviyoProfile(result, property, numberActiveSubs)
        })

    }).catch(function(e){
        console.log('houston, we have a problem', e)

    })

    res.send('Ok')
    return res.status(200).end()
})

app.post('/customerDeactivated', (req, res) => {

    console.log('customer deactivated: ', req.body)

    var email = req.body.customer.email
 
    //Get the Klaviyo ID by looking up the email in the list
    getKlaviyoID(email).then(function(result){

        var property = "AA-ReCharge_Status"
        var subStatus = req.body.customer.status
       
        if(result.status !== 200){
            console.log('failedddd.  Could be due to not opted into email list so look up in klaviyo for their ID fails -- we need to make sure everyone is on at least one list', result)
        } else {
            //Update th klaviyo profile with proper ReCharge Inactive Status 
            
            updateKlaviyoProfile(result, property, subStatus)
        }

    }).catch(function(e){
        console.log('console logging error')
    })



    //Return 200 back to the webhook letting recharge know we received it
    res.send('Ok')
    return res.status(200).end()
})


//This webhook will trigger when we activate a customer.  An activation means that a subscription has been added to a customer who didn't have an active subscription prior to that moment. 
app.post('/customerActivated', (req, res) => {

    console.log('customer activated', req.body)

    var email = req.body.customer.email

    getKlaviyoID(email).then(function(result){

        var property = "AA-ReCharge_Status"
        var subStatus = req.body.customer.status

        if(result.status !== 200){
            console.log('Failed Activate.  Most likely due to the fact that they opted out of Marketing at signup and they are not in a list in Klaviyo', result)
        }
        else {
            //console.log(result)
            updateKlaviyoProfile(result, property, subStatus)
        }
    }).catch(function(e){
        console.log('catch on activate', e)
    })


    res.send('ok')
    return res.status(200).end()


})

// app.post('/createdCustomer', (req, res) => {

//     console.log(req.body)



//     getKlaviyoID(email).then(function(result){

//         var property = "AA-ReCharge_Status"
//         var subStatus = req.body.customer.status

//         if(result.status !== 200){
//             console.log('Failed Activate', result)
//         }
//         else {
//             console.log(result)
//             updateKlaviyoProfile(result, property, subStatus)
//         }
//     }).catch(function(e){
//         console.log('catch on activate', e)
//     })


//     res.send('ok')
//     return res.status(200).end()


// })

app.listen(port, () => {
    console.log('server is up on port ' + port)
})