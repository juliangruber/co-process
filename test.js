var co = require('co');
var each = require('./');
var wait = require('co-wait');
var assert = require('assert');

describe('each', function(){
  describe('fast producer', function(){
    it('should run in parallel', function(done){
      var left = 3;
      var concurrency = 0;
      var max = 0;
      
      co(function*(){
        yield each(gen(), function*(data){
          concurrency++;
          max = Math.max(concurrency, max);
          yield wait(400);
          concurrency--;
        });
      })(function(err){
        if (err) return done(err);
        assert(!left);
        assert(max > 1);
        done();
      });
      
      function gen(){
        return function(cb){
          if (!--left) return cb();
          setTimeout(function(){
            cb(null, Math.random());
          }, 100);
        }
      }
    });
  });

  describe('fast consumer', function(){
    it('should wait for all fns to finish', function(done){
      var left = 3;
      
      co(function*(){
        yield each(gen(), function*(data){});
      })(function(err){
        if (err) return done(err);
        assert(!left);
        done();
      });
      
      function gen(){
        return function(cb){
          if (!--left) return cb();
          setTimeout(function(){
            cb(null, Math.random());
          }, 100);
        }
      }
    });
  });
});

