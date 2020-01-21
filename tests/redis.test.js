var redis = require('redis'), redis_client = redis.createClient();

test('Storing an example', () => {
    redis_client.set("example", JSON.stringify({hello: "world"}));    
    redis_client.quit();
});
