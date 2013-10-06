var pre    = require('../');
var level  = require('level');
var test   = require('tape');
var rimraf = require('rimraf');
var db;
var preDb;
var prefix;
var path = '/tmp/test-level-prefix';

rimraf(path, function(err) {
  if (err) { throw err; }

  function setup(cb) {
    db     = level(path);
    prefix = 'ns-';
    preDb = pre(db).prefix(prefix);
    db.put(prefix + 'foo', 'JoeBar', cb);
  }

  setup(function(err) {
    if (err) { throw err; }

    test('get', function(t) {
      t.plan(4);

      function getAndCheck(dbInstance, key, assertMsg) {
        dbInstance.get(key, function(err, val) {
          t.error(err);

          t.equal(val, 'JoeBar', assertMsg);
        });
      }

      getAndCheck(preDb, 'foo', 'preDb.get()');
      // make sure db.get() works like before prefixing
      getAndCheck(db, (prefix + 'foo'), 'db.get()');
    });
  });
});
