const mongoose = require('mongoose');
const exec = mongoose.Query.prototype.exec;
const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
const util = require('util');
client.get = util.promisify(client.get);

mongoose.Query.prototype.cache = function() {
    this.useCache = true;
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
    const cacheValue = await client.get(key);
    if (cacheValue) {
        const doc = JSON.parse(cacheValue);
        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
    }
    client.set(key, JSON.stringify(result));
    return result;
};