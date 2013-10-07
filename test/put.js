var pre = require('../');
var level = require('level');
var test = require('tape');
var rimraf = require('rimraf');
var path = '/tmp/test-level-prefix';

test('put', function(t) {
  t.plan(6);
  rimraf.sync(path);

  var db = level(path);
  var prefix = 'ns-';
  var preDb = pre(db).prefix(prefix);

  function putAndCheck(dbInstance, key, val, assertMsg) {
    dbInstance.put(key, val, function(err) {
      t.error(err);
      dbInstance.get(key, function(err, val2) {
        t.error(err);
        t.equal(val, val2, assertMsg);
      });
    });
  }

  putAndCheck(preDb, 'foo', 'bar', 'preDb.put()');
  putAndCheck(db, 'foo2', 'bar2', 'db.put()');
});

