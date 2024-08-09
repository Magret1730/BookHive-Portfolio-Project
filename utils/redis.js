import redis from 'redis';
// import { createClient } from '@redis/client';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    this.client.on('error', (err) => {
      console.error(`Redis client not connected to the server: ${err.message}`);
    });

    this.client.on('connect', () => {
      console.log('Redis client connected to the server');
    });

    // Promisify Redis client methods
    this.pingAsync = promisify(this.client.ping).bind(this.client);
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  // Check if the Redis client is connected
  async isAlive() {
    try {
      console.log('good ');
      const response = await this.pingAsync();
      return true;
    } catch (err) {
      console.error('Redis client ping failed:', err.message);
      return false;
    }
  }

  async get(key) {
    try {
      const value = await this.getAsync(key);
      return value;
    } catch (err) {
      return (`Can't get ${key}: ${err.message}`);
    }
  }

  async set(key, value, duration) {
    try {
      // console.log('Before setAsync');
      await this.setAsync(key, value, 'EX', duration);
      // console.log('After setAsync');
      return `Key ${key} set successfully`;
    } catch (err) {
      return (`Can't set ${key} of value ${value}: ${err.message}`);
    }
  }

  async del(key) {
    try {
      return await this.delAsync(key);
    } catch (err) {
      return (`Can't delete ${key}: ${err.message}`);
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
