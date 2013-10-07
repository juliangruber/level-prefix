var pre = require('../');
var level = require('level');
var test = require('tape');
var rimraf = require('rimraf');
var path = '/tmp/test-level-prefix';

test('readStream', function(t) {
  t.plan(3);
  rimraf.sync(path);

  var db = level(path);
  var prefix = 'ns-';
  var preDb = pre(db).prefix(prefix);

  for (i = 0; i < 10; i++) {
    db.put(prefix + i, 'JoeBar');
  }

  db.put('foo', 'bar');
  db.put('baz', 'bz');

  function checkReadStream(dbInstance, opts, count, assertMsg) {
    dbInstance.createReadStream(opts).on('data', function() {
      count--;
    }).on('end', function() {
      t.equal(count, 0, assertMsg);
    });
  }

  checkReadStream(db, {}, 12, 'db.createReadStream() no opts');
  checkReadStream(preDb, {}, 10, 'preDb.createReadStream() no opts');
  checkReadStream(preDb, {
    start : '6',
    end   : '8',
  }, 3, 'preDb.createReadStream with opts');
});

