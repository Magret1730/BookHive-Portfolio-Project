// import redis from 'redis';
import { createClient } from '@redis/client';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();

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

  // isAlive() {
  //   return this.client.connected;
  // }

  // Check if the Redis client is connected
  async isAlive() {
    try {
      console.log('good ');
      const response = await this.pingAsync();
      console.log('Redis ping response:', response);
      // return response === 'PONG';
      // return true;
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
      await this.setAsync(key, value, 'EX', duration);
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
