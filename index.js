
/**
 * Module dependencies.
 */

var co = require('co');
var chan = require('chan');
var debug = require('debug')('co-each');

/**
 * Expose `each`.
 */

module.exports = each;

/**
 * Iterate over generators in parallel.
 *
 * Example:
 * 
 *   yield each(on(emitter, 'data'), function*(data){
 *     yield process(data);
 *   });
 * 
 * @param {Function} gen
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function each(gen, fn){
  return function(done){
    var data;
    var queue = chan();
    var quit = chan();
    var workers = [];
    var running = 0;
    
    // supervise
    
    co(function*(){
      var work;
      while (work = yield gen) {
        debug('work: %s', work);
        if (workers.length == running) spawn();
        queue(work);
      }
      
      queue(false);
      while (yield quit) continue;
    })(done);
    
    // work
    
    function spawn(){
      var idx = workers.length;
      debug('worker %s: spawn', idx);
      
      var worker = co(function*(){
        var work;
        while (work = yield queue) {
          running++;
          debug('worker %s: consume %s', idx, work);
          yield fn(work);
          running--;
        }
        
        debug('worker %s: quit', idx);
        quit(running);
      });
      worker(done);
      workers.push(worker);
    }
  };
}
