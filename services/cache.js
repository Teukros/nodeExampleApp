const mongoose = require('mongoose');
const exec = mongoose.Query.prototype.exec;
const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
const util = require('util');
client.get = util.promisify(client.get);

mongoose.Query.prototype.exec = function () {
    console.log("i'm about to run a query:");
    console.log(this.getQuery());
    console.log(this.mongooseCollection.name);

    const key = Object.assign(
        {},
        this.getQuery(),
        {collection: this.mongooseCollection.name});
    return exec.apply(this, arguments);
};