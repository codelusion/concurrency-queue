'use strict';

var ThrottledQueue = require('./lib/ThrottledQueue');

module.exports.createInstance = function (options) {
    var tq = new ThrottledQueue(options);
    var events = ['ready', 'queued', 'unknown'];
    events.forEach(function (eventName) {
        var optionName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
        if (options[optionName]) {
            var eventHandler = options[optionName];
            tq.on(eventName, eventHandler);
        }
    });

    return {
        push: tq.push.bind(tq),
        drain: tq.drain.bind(tq)
    }
};