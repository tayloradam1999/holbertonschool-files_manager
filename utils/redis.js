const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  // the constructor that creates a client to Redis:
  // any error displayed in the console
  constructor() {
    this.client = redis.createClient({ legacyMode: true });
    this.client.on('error', (error) => console.log(error));
  }

  isAlive() {
    // returns if Redis Client and DB client are alive
    return this.client.connected;
  }

  // get function returns the Redis value stored for this key
  async get(key) {
    const getFunc = promisify(this.client.get).bind(this.client);
    const redisValue = await getFunc(key).catch(console.error);
    return redisValue;
  }

  // set function takes args to store it in Redis (with an expiration set by the duration argument)
  async set(key, value, duration) {
    const setFunc = promisify(this.client.set).bind(this.client);
    await setFunc(key, value, 'EX', duration).catch(console.error);
  }

  // del fucntion removes the value in Redis for this key
  async del(key) {
    const delFunc = promisify(this.client.del).bind(this.client);
    await delFunc(key).catch(console.error);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
