'use strict';

var ConcurrencyQueue = require('./lib/ConcurrencyQueue');

module.exports.createInstance = function (options) {
    var cQ = new ConcurrencyQueue(options);
    var events = ['ready', 'queued', 'drained', 'unknown'];
    events.forEach(function (eventName) {
        var optionName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
        if (options[optionName]) {
            var eventHandler = options[optionName];
            cQ.on(eventName, eventHandler);
        }
    });

    return {
        push: cQ.push.bind(cQ),
        drain: cQ.drain.bind(cQ),
        on: function(eventName, eventHandler) {
            cQ.on(eventName, eventHandler);
        }
    }
};