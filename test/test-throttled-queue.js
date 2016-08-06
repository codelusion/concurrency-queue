'use strict';
var should = require('chai').should();
var throttledQueue = require('../index.js');

var item1 = {name: 'item1', 'val' : 4};
var item2 = {name: 'item2', 'val' : 5};
var item3 = {name: 'item3', 'val' : 2};
var item4 = {name: 'item4', 'val' : 2};
var result = {};
var tQ;
var options = {
    'maxConcurrent': 3,
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

describe('Throttled-Queue', function() {
    describe('#push', function() {

        beforeEach(function() {
            tQ = null;
            result = {};
        });

        it("should fire a 'ready' event when adding items till maxConcurrent is reached", function() {
            tQ = throttledQueue.createInstance(options);
            tQ.push(item1);
            result.onReady.should.not.equal(undefined);
            result.onReady[0].should.equal(item1);
            result.onReady[1].should.exist;
            var itemId1 = result.onReady[1];
            result.onReady[2].should.deep.equal({ maxConcurrent: 3, processing: 1, queued: 0 });
            tQ.push(item1);
            result.onReady.should.not.equal(undefined);
            result.onReady[0].should.equal(item1);
            result.onReady[1].should.exist;
            result.onReady[1].should.not.equal(itemId1);
            result.onReady[2].should.deep.equal({ maxConcurrent: 3, processing: 2, queued: 0 });
        });
        it("should fire a 'queued' event when maxConcurrent reached", function() {
            tQ = throttledQueue.createInstance(options);
            tQ.push(item1);
            tQ.push(item2);
            tQ.push(item3);
            tQ.push(item4);
            result.onQueued.should.not.equal(undefined);
            result.onQueued[0].should.equal(item4);
            result.onQueued[1].should.exist;
            result.onQueued[2].should.deep.equal({ maxConcurrent: 3, processing: 3, queued: 1 });
            tQ.push(item2);
            result.onQueued.should.not.equal(undefined);
            result.onQueued[0].should.equal(item2);
            result.onQueued[1].should.exist;
            result.onQueued[2].should.deep.equal({ maxConcurrent: 3, processing: 3, queued: 2 });
        });
        it("should fire a 'ready' event and release a queued item when drained", function() {
            tQ = throttledQueue.createInstance(options);
            tQ.push(item1);
            tQ.push(item2);
            var itemId2 = result.onReady[1];
            tQ.push(item3);
            tQ.push(item4);
            var itemId4 = result.onQueued[1];
            result.onQueued[0].should.equal(item4);
            result.onQueued[2].should.deep.equal({ maxConcurrent: 3, processing: 3, queued: 1 });
            tQ.drain(itemId2);
            result.onReady[0].should.equal(item4);
            result.onReady[1].should.equal(itemId4);
            result.onReady[2].should.deep.equal({ maxConcurrent: 3, processing: 3, queued: 0 });
        });
    });
});

