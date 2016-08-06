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
    }
};

describe('Concurrency-Queue', function() {
    describe('#basic operations', function() {

        beforeEach(function() {
            cQ = null;
            result = {};
        });

        it("should fire a 'ready' event when adding items till maxConcurrency is reached", function() {
            cQ = throttledQueue.createInstance(options);
            cQ.push(job1);
            result.onReady.should.not.equal(undefined);
            result.onReady[0].should.equal(job1);
            result.onReady[1].should.exist;
            var itemId1 = result.onReady[1];
            result.onReady[2].should.deep.equal({ maxConcurrency: 3, processing: 1, queued: 0 });
            cQ.push(job1);
            result.onReady.should.not.equal(undefined);
            result.onReady[0].should.equal(job1);
            result.onReady[1].should.exist;
            result.onReady[1].should.not.equal(itemId1);
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
        it("should fire a 'ready' event and release a queued item when drained", function() {
            cQ = throttledQueue.createInstance(options);
            cQ.push(job1);
            cQ.push(job2);
            var itemId2 = result.onReady[1];
            cQ.push(job3);
            cQ.push(job4);
            var itemId4 = result.onQueued[1];
            result.onQueued[0].should.equal(job4);
            result.onQueued[2].should.deep.equal({ maxConcurrency: 3, processing: 3, queued: 1 });
            cQ.drain(itemId2);
            result.onReady[0].should.equal(job4);
            result.onReady[1].should.equal(itemId4);
            result.onReady[2].should.deep.equal({ maxConcurrency: 3, processing: 3, queued: 0 });
        });
    });
});

