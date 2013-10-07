var pre = require('../');
var level = require('level');
var test = require('tape');
var rimraf = require('rimraf');
var path = '/tmp/test-level-prefix';

test('del', function(t) {
  t.plan(4);
  rimraf.sync(path);

  var db = level(path);
  var prefix = 'ns-';
  var preDb = pre(db).prefix(prefix);

  db.put(prefix + 'foo', 'JoeBar');
  db.put('bar', 'JoeBar');

  function delAndCheck(dbInstance, key, assertMsg) {
    dbInstance.del(key, function(err) {
      t.error(err);

      dbInstance.get(key, function(err) {
        t.ok(err && err.notFound);
      });
    });
  }

  delAndCheck(preDb, 'foo', 'preDb.del()');
  delAndCheck(db, (prefix + 'foo'), 'db.del()');
});

