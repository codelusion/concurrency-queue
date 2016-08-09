'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var uuid = require('uuid');

function ConcurrencyQueue(options) {
    EventEmitter.call(this);
    if (isNaN(parseInt(options.maxConcurrency))) {
        throw new Error('maxConcurrency invalid');
    }
    this.maxConcurrency = parseInt(options.maxConcurrency);
    this.processQ = [];
    this.jobBucket = {};
    this.waitingQ = [];

}

util.inherits(ConcurrencyQueue, EventEmitter);

ConcurrencyQueue.prototype.push = function (job) {
    var jobId = uuid.v1();
    this.jobBucket[jobId] = job;
    if (this.processQ.length >= this.maxConcurrency) {
        this.waitingQ.push(jobId);
        this.emit('queued', job, jobId, this.currentStatus());
    } else {
        this.release(jobId);
    }
    return jobId;
};

ConcurrencyQueue.prototype.currentStatus = function () {
    return {
        "maxConcurrency": this.maxConcurrency,
        'processing': this.processQ.length,
        'queued': this.waitingQ.length
    }
};

ConcurrencyQueue.prototype.drain = function (jobId) {
    var idx = this.processQ.indexOf(jobId);
    if (idx > -1) {
        this.processQ.splice(idx, 1);
        var job = this.jobBucket[jobId];
        delete this.jobBucket[jobId];
        this.emit('drained', job, jobId, this.currentStatus());
        job = null;
        if (this.waitingQ.length > 0) {
            this.release(this.waitingQ.pop());
        }
    } else {
        this.emit('unknown', null, jobId, this.currentStatus());
    }
};

ConcurrencyQueue.prototype.release = function (jobId) {
    this.processQ.push(jobId);
    this.emit('ready', this.jobBucket[jobId], jobId, this.currentStatus());
};

module.exports = ConcurrencyQueue;