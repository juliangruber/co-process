var co = require('co');
var each = require('./');
var wait = require('co-wait');

co(function*(){
  
  console.log('start');
  
  yield each(gen(), function*(data){
    yield process(data);
  });
  
  console.log('end');
  
})(function(err){
  if (err) throw err;
});

var i = 0;

function gen(){
  return function(cb){
    if (++i == 3) return cb();
    setTimeout(function(){
      cb(null, Math.random());
    }, 1000);
  }
}

function* process(data){
  console.log('process: %s', data);
  yield wait(5000);
}
