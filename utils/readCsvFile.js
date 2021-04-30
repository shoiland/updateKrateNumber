const fs = require('fs'); 
const csv = require('csv-parser')
const results = []; 
var numberActiveCustomers = 0; 
var numberActiveSubs = 0; 


fs.createReadStream('data/customers.csv')
    .pipe(csv())
    .on('data', (data) => {
        if (data.number_active_subscriptions > 0)
        {
            numberActiveCustomers += 1; 
            numberActiveSubs = numberActiveSubs + Number(data.number_active_subscriptions); 
        }
    })
    .on('end', () => {
        console.log(numberActiveCustomers); 
        console.log(numberActiveSubs);
    })

setTimeout(function(){
    console.log('hey')
    console.log(results)
}, 3000)