var co = require('co');
var process = require('./');
var wait = require('co-wait');

co(function*(){
  
  console.log('start');
  
  yield process(gen(), function*(data){
    console.log('process: %s', data);
    yield wait(5000);
    console.log('done: %s', data);
  });
  
  console.log('end');
  
})(function(err){
  if (err) throw err;
});

var i = 0;

function gen(){
  return function(cb){
    console.log('gen')
    if (++i == 3) return cb();
    setTimeout(function(){
      cb(null, Math.random());
    }, 1000);
  }
}
