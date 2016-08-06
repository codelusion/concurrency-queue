## concurrent-queue
A queue that holds jobs, releasing only a fixed number for concurrent processing.

### Usage

#### Install
```
    npm install concurrent-queue
```
#### Use


```
var cQ = require('concurrent-queue')
            .createInstance({
                'maxConcurrency': 3
            });

var job1 = {name: 'job1', 'val': 8};
var job2 = {name: 'job2', 'val': 3};
var job3 = {name: 'job3', 'val': 5};
var job4 = {name: 'job4', 'val': 2};

//listen for the 'ready' event for when a job can be processed
//based on the maxConcurrency rules
cQ.on('ready', function (job, jobId, status) {
    console.log(['ready:', job, jobId, status]);
    //simulate processing job
    setTimeout(function() {
        //when completed processing
        //drain queue of job, releasing next job in queue
        cQ.drain(jobId); 
    }, job.val * 1000);
});
```

The 'queued' event is fired when a job is queued i.e, max number of concurrent jobs already being processed
```
cQ.on('queued', function (job, jobId, status) {
    console.log(['queued:', job, jobId, status]);
});
```
The 'drained' event is fired when a job is drained from the queue, when will release a queued job, if any are available.

```
cQ.on('drained', function (job, jobId, status) {
    console.log(['drained:', job, jobId, status]);
});
```

cQ.push(job1); //'ready' event fired
cQ.push(job2); //'ready' event fired
cQ.push(job3); //'ready' event fired
cQ.push(job4); //'queued' event fired,
// when first job (job2) is drained, 
//'ready' event fires for job4
```

### License: 
MIT - See LICENSE file.

