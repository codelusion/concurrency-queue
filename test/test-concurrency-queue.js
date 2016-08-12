'use strict';
var should = require('chai').should();
var throttledQueue = require('../index.js');

var job1 = {name: 'job1', 'val' : 4};
var job2 = {name: 'job2', 'val' : 5};
var job3 = {name: 'job3', 'val' : 2};
var job4 = {name: 'job4', 'val' : 2};
var result = {};
var cQ;
var options = {
    'maxConcurrency': 3,
    'onReady': function () {
        result.onReady = arguments;
    },
    'onQueued': function () {
        result.onQueued = arguments;
    },
    'onUnknown': function () {
        result.onUnknown = arguments;
    },
    'onDrained': function () {
        result.onDrained = arguments;
    },
    'onEmpty': function () {
        result.onEmpty = arguments;
    }
};

describe('Concurrency-Queue', function() {
    describe('#basic operations', function() {

        beforeEach(function() {
            cQ = null;
            result = {};
        });

        it("should fire a 'ready' event when adding jobs till maxConcurrency is reached", function() {
            cQ = throttledQueue.createInstance(options);
            cQ.push(job1);
            result.onReady.should.not.equal(undefined);
            result.onReady[0].should.equal(job1);
            result.onReady[1].should.exist;
            var jobId1 = result.onReady[1];
            result.onReady[2].should.deep.equal({ maxConcurrency: 3, processing: 1, queued: 0 });
            cQ.push(job1);
            result.onReady.should.not.equal(undefined);
            result.onReady[0].should.equal(job1);
            result.onReady[1].should.exist;
            result.onReady[1].should.not.equal(jobId1);
            result.onReady[2].should.deep.equal({ maxConcurrency: 3, processing: 2, queued: 0 });
        });
        it("should fire a 'queued' event when maxConcurrency reached", function() {
            cQ = throttledQueue.createInstance(options);
            cQ.push(job1);
            cQ.push(job2);
            cQ.push(job3);
            cQ.push(job4);
            result.onQueued.should.not.equal(undefined);
            result.onQueued[0].should.equal(job4);
            result.onQueued[1].should.exist;
            result.onQueued[2].should.deep.equal({ maxConcurrency: 3, processing: 3, queued: 1 });
            cQ.push(job2);
            result.onQueued.should.not.equal(undefined);
            result.onQueued[0].should.equal(job2);
            result.onQueued[1].should.exist;
            result.onQueued[2].should.deep.equal({ maxConcurrency: 3, processing: 3, queued: 2 });
        });
        it("should fire a 'ready' event and release a queued job when drained", function() {
            cQ = throttledQueue.createInstance(options);
            cQ.push(job1);
            var jobId2 = cQ.push(job2);
            cQ.push(job3);
            var jobId4 = cQ.push(job4);
            result.onQueued[0].should.equal(job4);
            result.onQueued[2].should.deep.equal({ maxConcurrency: 3, processing: 3, queued: 1 });
            cQ.drain(jobId2);
            result.onReady[0].should.equal(job4);
            result.onReady[1].should.equal(jobId4);
            result.onReady[2].should.deep.equal({ maxConcurrency: 3, processing: 3, queued: 0 });
        });
        it("should fire a 'drained' event and and 'empty' event when completely drained", function() {
            options.maxConcurrency = 2;
            cQ = throttledQueue.createInstance(options);
            var jobId1 = cQ.push(job1);
            var jobId2 = cQ.push(job2);
            cQ.drain(jobId1);
            result.onDrained[0].should.equal(job1);
            result.onDrained[2].should.deep.equal({ maxConcurrency: 2, processing: 1, queued: 0 });
            cQ.drain(jobId2);
            result.onDrained[1].should.equal(jobId2);
            result.onDrained[2].should.deep.equal({ maxConcurrency: 2, processing: 0, queued: 0 });
            should.not.exist(result.onEmpty[0]);
            should.not.exist(result.onEmpty[1]);
            result.onEmpty[2].should.deep.equal({ maxConcurrency: 2, processing: 0, queued: 0 })
        });
    });
});

