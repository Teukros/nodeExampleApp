const mongoose = require('mongoose');
const exec = mongoose.Query.prototype.exec;
const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
const util = require('util');
const keys = require('../config/keys');

client.hget = util.promisify(client.hget);

mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;
};

mongoose.Query.prototype.exec = async function () {
    console.log("i'm about to run a query:");
    console.log(this.getQuery());
    console.log(this.mongooseCollection.name);

    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(Object.assign(
        {},
        this.getQuery(),
        {collection: this.mongooseCollection.name})
    );
    // see if we have a value for this key in redis
    const cacheValue = await client.hget(this.hashKey, key);
    //if we do, return that
    if (cacheValue) {
        const doc = JSON.parse(cacheValue);
        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
    }
    // otherwise, get it from mongo and set it in redis
    const result = await exec.apply(this, arguments);
    client.hset(this.hashKey, key, JSON.stringify(result));
    return result;
};

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
};