/*
    @description: Encargado de entregar el valor de cambio de dólar para venta y compra
    @port: 3001
*/
var SERVICE_PORT = 3001;
var redis = require('redis');
var express = require('express');
var morgan = require('morgan')
var axios = require('axios');
var moment = require('moment');
var app = express();
    app .use(morgan('combined'))
let Parser = require('rss-parser');
let parser = new Parser();

// Connect Redis
var client;
try {
    client = redis.createClient();
    console.log("Redis client connected succesfully.")
} catch (e) {
    console.log("Error trying to connect with Redis. Trying again in 3 seconds.")
    setTimeout(createClient, 3000);
};

/*
    @response: JSON
    @body:
    dollar: {
        sell: 753.20,
        buy: 790.10
    }

*/    
app.get('/dollar', async function (req, res) {
    var date = moment().format("DD-MM-YYYY");
    var dollar_key_for_redis = 'dollar:' + date;
    
    client.get(dollar_key_for_redis, async function (error, result) {
        if(!result) {
            try {
                var dollar_buy_json = await axios.get('https://mindicador.cl/api/dolar');
                var dollar_buy = dollar_buy_json.data.serie[0].valor;
                var dollar_sell = dollar_buy_json.data.serie[0].valor - 30;
            } catch(e) {
                var dollar_buy = 0;
                var dollar_sell = 0;
            }

            var dollar_object = {
                dollar: {
                    sell: dollar_sell,
                    buy: dollar_buy
                }
            }
            
            // We send the information as jSON
            if(dollar_buy >0 && dollar_sell > 0) {
                // We set the news into the redis
                client.set(dollar_key_for_redis, JSON.stringify(dollar_object));
                console.log("Storing news for getting this information from cache");

                res.send({
                    success: true,
                    msg: "SUCCESS",
                    data: dollar_object
                });
            } else {
                res.send({
                    success: false,
                    msg: "ERROR",
                    data: dollar_object
                });
            }
            

        } else {
            // We send the information as jSON
            res.send({
                success: true,
                msg: "SUCCESS",
                data: JSON.parse(result) 
            });
        }
    })
});


/*
    @response: JSON
    @body:
    dollar: {
        sell: 753.20,
        buy: 790.10
    }

*/    
app.get('/dollar/:dollar_date', async function (req, res) {
    var date = moment(req.params.dollar_date);
    var dollar_key_for_redis = 'dollar:' + date.format("DD-MM-YYYY");
    var dollar_price_found = false;
    
    client.get(dollar_key_for_redis, async function (error, result) {
        if(!result) {

            try {
                var dollar_buy_json = await axios.get('https://mindicador.cl/api/dolar/' + date.format("YYYY"));
                
                // I need to find the buy price            
                for(var i=0;i<dollar_buy_json.data.serie.length; i++) {
                    if(moment(dollar_buy_json.data.serie[i].fecha).format("DD-MM-YYYY")  == date.format("DD-MM-YYYY")) {
                        dollar_buy = dollar_buy_json.data.serie[i].valor;
                        dollar_sell = dollar_buy - 30;
                    }
                }
            } catch(e) {
                var dollar_buy = 0;
                var dollar_sell = 0;
            }

            // Dollar object structure
            var dollar_object = {
                dollar: {
                    sell: dollar_sell,
                    buy: dollar_buy
                }
            }
            
            // We send the information as jSON
            if(dollar_buy >0 && dollar_sell > 0) {
                // We set the news into the redis
                client.set(dollar_key_for_redis, JSON.stringify(dollar_object));
                console.log("Storing news for getting this information from cache");

                res.send({
                    success: true,
                    msg: "SUCCESS",
                    data: dollar_object
                });
            } else {
                res.send({
                    success: false,
                    msg: "Dollar not found",
                    data: {}
                });
            }

        } else {
            // We send the information as jSON
            res.send({
                success: true,
                msg: "SUCCESS",
                data: JSON.parse(result) 
            });
        }
    })
});

// Service UP
app.listen(SERVICE_PORT, function () {
    console.log('Ufro: Service Dollar on port ' + SERVICE_PORT);
});
module.exports = app;