'use strict';

var cQ = require('../index')
    .createInstance({'maxConcurrency': 3});


//jobs to process
var job1 = {name: 'job1', 'val': 8};
var job2 = {name: 'job2', 'val': 3};
var job3 = {name: 'job3', 'val': 5};
var job4 = {name: 'job4', 'val': 2};

cQ.on('ready', function (job, jobId, status) {
    console.log(['ready:', job, jobId, status]);
    //simulate processing job
    setTimeout(function(){
        cQ.drain(jobId); //triggers job ready for job4
    }, job.val * 1000);
});

cQ.on('queued', function (job, jobId, status) {
    console.log(['queued:', job, jobId, status]);
});

cQ.on('drained', function (job, jobId, status) {
    console.log(['drained:', job, jobId, status]);
});


cQ.push(job1); //'ready' event fired
cQ.push(job2); //'ready' event fired
cQ.push(job3); //'ready' event fired
cQ.push(job4); //'queued' event fired,
// when first job drained, 'ready' event fires for job4

