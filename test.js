var co = require('co');
var process = require('./');
var wait = require('co-wait');
var assert = require('assert');

describe('process', function(){
  describe('fast producer', function(){
    it('should run in parallel', function(done){
      var left = 3;
      var concurrency = 0;
      var max = 0;
      
      co(function*(){
        yield process(gen(), function*(data){
          concurrency++;
          max = Math.max(concurrency, max);
          yield wait(200);
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
          });
        }
      }
    });
  });
  
  describe('very fast producer', function(){
    it('should run in parallel', function(done){
      var left = 3;
      var concurrency = 0;
      var max = 0;
      
      co(function*(){
        yield process(gen(), function*(data){
          concurrency++;
          max = Math.max(concurrency, max);
          yield wait(200);
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
          cb(null, Math.random());
        }
      }
    });
  });
  
  describe('fast consumer', function(){
    it('should wait for all fns to finish', function(done){
      var left = 3;
      
      co(function*(){
        yield process(gen(), function*(data){
          yield wait(0);
        });
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
  
  describe('very fast consumer', function(){
    it('should wait for all fns to finish', function(done){
      var left = 3;
      
      co(function*(){
        yield process(gen(), function*(data){});
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
  
  describe('errors', function(){
    it('should catch errors in the producer', function(done){
      co(function*(){
        yield process(gen(), function*(data){});
      })(function(err){
        assert(err);
        done();
      });
      
      function gen(){
        return function(cb){
          cb(new Error('producer'));
        }
      }
    });
    
    it('should catch errors in the consumer', function(done){
      co(function*(){
        yield process(gen, function*(data){
          throw new Error('consumer');
        });
      })(function(err){
        assert(err);
        done();
      });
      
      function* gen(){
        yield wait(0);
        return Math.random();
      }
    });
  });
  
  describe('limited concurrency', function(){
    it('should run in series', function(done){
      var left = 3;
      var concurrency = 0;
      var max = 0;
      
      co(function*(){
        yield process(gen(), { max: 1 }, function*(data){
          concurrency++;
          max = Math.max(concurrency, max);
          yield wait(200);
          concurrency--;
        });
      })(function(err){
        if (err) return done(err);
        assert(!left);
        assert(max == 1);
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

