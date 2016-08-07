# concurrency-queue
A queue that holds jobs, releasing only a fixed number for concurrent processing.

## Usage

### Install
```
    npm install concurrency-queue
```
### Use

Use `.createInstance()` to setup a concurrency queue with `maxConcurrency` parameter.

```javascript
var cQ = require('concurrent-queue')
            .createInstance({
                'maxConcurrency': 3
            });
```

Listen for the 'ready' event for when a job can be processed based on the maxConcurrency rules.
The queue generates a unique `jobId` for each job instance pushed into the queue. 
The `status` field shows current state of the queue: `{ maxConcurrency: , processing: , queued:  }`. 

```javascript
cQ.on('ready', function (job, jobId, status) {
    //Do some job processing here
    
    //when complete, drain the queue of the job
    cQ.drain(jobId); 
});
```

When job processing is completed, use `.drain(jobId)` to drain queue of job, releasing next job in queue, if one exists.

The 'queued' event is fired when a job is queued i.e, max number of concurrent jobs already being processed.

```javascript
cQ.on('queued', function (job, jobId, status) {
    //job with jobId has been queued
});
```
The 'drained' event is fired when a job is drained from the queue, when will release a queued job, if any are available.

```javascript
cQ.on('drained', function (job, jobId, status) {
    //job with jobId has been drained from the queue
});
```

For examples see the `/examples/` folder.

### License: 
MIT - See LICENSE file.

