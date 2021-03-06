
/**
 * Module dependencies.
 */

var co = require('co');
var chan = require('chan');
var debug = require('debug')('co-process');
var first = require('co-first');
var wait = require('co-wait');

/**
 * Expose `process`.
 */

module.exports = process;

/**
 * Let `consumer` concurrently process work from `producer`..
 *
 * Options:
 *
 *   - max: limit maximum concurrency
 *   - timeout: kill workers after x milliseconds (default: 100)
 *
 * Example:
 * 
 *   yield process(on(emitter, 'data'), function*(data){
 *     yield process(data);
 *   });
 * 
 * @param {Function} producer
 * @param {Object=} opts
 * @param {Function} consumer
 * @return {Function}
 * @api public
 */

function process(producer, opts, consumer){
  if (typeof opts == 'function') {
    consumer = opts;
    opts = {};
  }
  
  var max = opts.max || Infinity;
  var timeout = opts.timeout || 100;
  
  return function(done){
    var queue = chan();
    var quit = chan();
    var workers = [];
    var running = 0;
    
    /**
     * Supervisor.
     *
     * Listens for work on `producer` and pushes it into the `queue`,
     * for workers to consume. If there's no free worker, the
     * supervisor spawns one.
     *
     * Whenever `producer` yields data it will be read -
     * there's no backpressure.
     *
     * When there's no more work to be done, signals and waits
     * for the workers to quit.
     */
    
    co(function*(){
      var work;
      while (work = yield producer) {
        debug('work: %s', work);
        if (workers.length == running && running < max) spawn();
        queue(work);
      }
      
      workers.forEach(function(){
        queue(false);
      });

      while (yield quit) continue;
    })(done);
    
    /**
     * Spawn a worker.
     *
     * A worker waits for work on the `queue` channel
     * and calls `consumer` once it got some. 
     *
     * A `false` on the `queue` channel signals the worker to
     * quit when it's done doing its current work.
     *
     * If the timeout yields before new work is received,
     * the worker quits to free resources.
     *
     * Before quitting it notifies the supervisor via the
     * `quit`channel.
     *
     * The `running` count is kept up to date for the
     * supervisor to know if it should spawn new workers.
     *
     * @api private
     */
    
    function spawn(){
      var idx = workers.length;
      debug('worker %s: spawn', idx);
      
      var worker = co(function*(){
        var res;
        var timeout;
        while (res = yield first([queue, timeout = wait(timeout)])) {
          if (res.caller == queue) {
            var work = res.value;
            if (!work) break;
            debug('worker %s: consume %s', idx, work);
            running++;
            yield consumer(work);
            running--;
          } else {
            debug('worker %s: timeout', idx);
            break;
          }
        }
        
        debug('worker %s: quit', idx);
        quit(running);
      });
      
      worker(function(err){
        idx = workers.indexOf(worker);
        workers.splice(idx, 1);
        if (err) done(err);
      });
      
      workers.push(worker);
    }
  };
}
