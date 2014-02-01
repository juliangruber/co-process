
/**
 * Module dependencies.
 */

var co = require('co');

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
    var left = 0;

    next();

    function next(){
      co(function*(){
        return yield gen;
      })(function(err, data){
        if (err) return done(err);
        if (!data && !left) return done();
        if (!data) return;
        
        next();
        left++;
        
        co(function*(){
          yield fn(data);
        })(function(err){
          if (err) return done(err);
          if (!--left) done();
        });
      });
    }
  }
}