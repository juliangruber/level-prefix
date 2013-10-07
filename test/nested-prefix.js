var pre = require('../');
var level = require('level');
var test = require('tape');
var after = require('after');
var rimraf = require('rimraf');
var path = '/tmp/test-level-prefix';

test('get', function(t) {
  t.plan(15);
  rimraf.sync(path);

  var db = level(path);
  var prefix = 'ns-';
  var prefix2 = 'ns2-';
  var preDb = pre(db).prefix(prefix);
  var nestedDb = preDb.prefix(prefix2);

  function putAndGet(dbInstance, key, val, assertMsg, cb) {
    dbInstance.put(key, val, function(err) {
      t.error(err);
      get(dbInstance, key, val, assertMsg, cb);
    });
  }

  function get(dbInstance, key, val, assertMsg, cb) {
    dbInstance.get(key, function(err, val2) {
      t.error(err);
      t.equal(val, val2, assertMsg);
      if (cb) cb();
    });
  }

  var nextTest = after(3, function() {
    get(db, 'test', 'test', 'test prefixed values 1');
    get(db, prefix + 'test', 'test', 'test prefixed values 2');
    get(db, prefix + prefix2 + 'test', 'test', 'test prefixed values 3');
  });

  putAndGet(db, 'test', 'test', 'db', nextTest);
  putAndGet(preDb, 'test', 'test', 'preDb', nextTest);
  putAndGet(nestedDb, 'test', 'test', 'nestedDb', nextTest);
});

