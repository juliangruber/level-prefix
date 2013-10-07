var pre = require('../');
var level = require('level');
var test = require('tape');
var rimraf = require('rimraf');
var path = '/tmp/test-level-prefix';

test('get', function(t) {
  t.plan(5);
  rimraf.sync(path);

  var db = level(path);
  var prefix = 'ns-';
  var preDb = pre(db).prefix(prefix);

  db.put(prefix + 'foo', 'JoeBar', function(err) {
    t.error(err);
    getAndCheck(preDb, 'foo', 'preDb.get()');
    getAndCheck(db, (prefix + 'foo'), 'db.get()');
  });

  function getAndCheck(dbInstance, key, assertMsg) {
    dbInstance.get(key, function(err, val) {
      t.error(err);
      t.equal(val, 'JoeBar', assertMsg);
    });
  }
});

