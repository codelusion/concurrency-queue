# concurrency-queue
A lightweight, minimalist FIFO queue that holds jobs, releasing only a fixed number 
for concurrent processing.

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
Then push a job into the queue: 
```javascript
    var jobId = cQ.push(job)    
```
The queue generates a unique `jobId` for each job instance pushed into the queue. 

### Events

### Ready Event

The 'ready' event is fired when a job is released to be processed based on the maxConcurrency rules.

```javascript
cQ.on('ready', function (job, jobId, status) {
    //Do some job processing here
    
    //when complete, drain the queue of the job
    cQ.drain(jobId); 
});
```

The `status` field shows current state of the queue: 
`{ maxConcurrency: xx, processing: xx, queued: xx }`. 

When job processing is completed, use `.drain(jobId)` to drain queue of job, releasing next job in queue, if one exists.

### Queued Event

The 'queued' event is fired when a job is queued i.e, max number of concurrent jobs already being processed.

```javascript
cQ.on('queued', function (job, jobId, status) {
    //job with jobId has been queued
});
```
### Drained Event
The 'drained' event is fired when a job is drained from the queue. This releases the next queued job, if any are available.

```javascript
cQ.on('drained', function (job, jobId, status) {
    //job with jobId has been drained from the queue
});
```

### Empty Event

Finally an 'empty' event is fired when the last job is drained from the queue.

For examples see the `/examples/` folder.

### License: 
MIT - See LICENSE file.

