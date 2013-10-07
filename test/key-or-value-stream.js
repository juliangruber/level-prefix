var pre = require('../');
var level = require('level');
var test = require('tape');
var rimraf = require('rimraf');
var path = '/tmp/test-level-prefix';


test('keyStream && valueStream', function(t) {
  t.plan(12);
  rimraf.sync(path);

  var db = level(path);
  var prefix = 'ns-';
  var preDb = pre(db).prefix(prefix);

  for (i = 0; i < 10; i++) {
    db.put(prefix + i, 'prefixed-' + i);
  }
  db.put('foo', 'original-1');
  db.put('foo2', 'original-2');

  function checkStream(type) {
    return function(dbInstance, opts, params) {
      var data = [];

      dbInstance['create' + type + 'Stream'](opts).on('data', function(item) {
        data.push(item);
      }).on('end', function() {
        var ok = true;
        t.equal(params.count, data.length, params.assertMsg);
        data.forEach(function(item) {
          if (!params.pattern.test(item)) ok = false;
        });
        t.equal(ok, true, params.assertMsg);
      });
    }
  }

  var checkKeyStream = checkStream('Key');
  var checkValueStream = checkStream('Value');

  checkKeyStream(db, {}, {
    count: 12,
    assertMsg: 'db.createKeyStream() no opts',
    pattern: /^(foo|ns)/
  });
  checkKeyStream(preDb, {}, {
    count: 10,
    assertMsg: 'preDb.createKeyStream() no opts',
    pattern: /^ns-/
  });
  checkKeyStream(preDb, {
    start: '6',
    end: '8',
  }, {
    count: 3,
    assertMsg: 'preDb.createKeyStream() with opts',
    pattern: /^ns-/
  });

  checkValueStream(db, {}, {
    count: 12,
    assertMsg: 'db.createValueStream() no opts',
    pattern: /^(prefixed|original)/
  });
  checkValueStream(preDb, {}, {
    count: 10,
    assertMsg: 'preDb.createValueStream() no opts',
    pattern: /^prefixed-/
  });
  checkValueStream(preDb, {
    start: '6',
    end: '8',
  }, {
    count: 3,
    assertMsg: 'preDb.createValueStream() with opts',
    pattern: /^prefixed-/
  });
});

