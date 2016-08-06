'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var uuid = require('uuid');

function ThrottledQueue(options) {
    EventEmitter.call(this);
    this.maxConcurrent = options.maxConcurrent || 5;
    this.processQ = [];
    this.jobBucket = {};
    this.waitingQ = [];

}

util.inherits(ThrottledQueue, EventEmitter);

ThrottledQueue.prototype.push = function (job) {
    var jobId = uuid.v1();
    this.jobBucket[jobId] = job;
    if (this.processQ.length >= this.maxConcurrent) {
        this.waitingQ.push(jobId);
        this.emit('queued', job, jobId, this.currentStatus());
    } else {
        this.release(jobId);
    }
};

ThrottledQueue.prototype.currentStatus = function () {
    return {
        'maxConcurrent': this.maxConcurrent,
        'processing': this.processQ.length,
        'queued': this.waitingQ.length
    }
};

ThrottledQueue.prototype.drain = function (jobId) {
    var idx = this.processQ.indexOf(jobId);
    if (idx > -1) {
        this.processQ.splice(idx, 1);
        delete this.jobBucket[jobId];
        this.release(this.waitingQ.pop());
    } else {
        this.emit('unknown', jobId, this.currentStatus());
    }
};

ThrottledQueue.prototype.release = function (jobId) {
    this.processQ.push(jobId);
    this.emit('ready', this.jobBucket[jobId], jobId, this.currentStatus());
};

module.exports = ThrottledQueue;