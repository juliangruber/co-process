
# co-process

  Concurrent producer/consumer processing for [co](https://github.com/visionmedia/co) with optional concurrency control.

  Also see [co-thread](https://github.com/visionmedia/co-thread) for a more lightweight but buffering implementation.

## Example

```js
var co = require('co');
var process = require('co-process');

co(function*(){
  yield process(getData(), function*(data){
    data = yield transform(data);
    yield db.put(data);
  });
})();
```

## API

### process(producer, consumer)

  Let `consumer` concurrently process work from `producer`.

  Whenever `producer` yields data - and maximum concurrency isn't reached - it will be read immediately. Stop processing by yielding a falsy value.

  Options:
  
    - max: limit maximum concurrency
    - timeout: kill workers after x milliseconds (default: 100)

## Debugging

  Set or add `co-process` to the `DEBUG` env variable to see how workers spawn, die and consume work.

## Installation

```bash
$ npm install co-process
```

## License

  MIT