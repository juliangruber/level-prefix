var pre    = require('../');
var level  = require('level');
var test   = require('tape');
var rimraf = require('rimraf');
var after  = require('after');
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
    cb();
  }

  setup(function(err) {
    test('get', function(t) {
      var nestedDb, prefix2, noop, nextTest;

      t.plan(15);

      prefix2  = 'ns2-';
      nestedDb = preDb.prefix(prefix2);
      noop     = function() {};

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

          cb = cb || noop;
          cb();
        });
      }

      nextTest = after(3, function() {
        get(db, 'test', 'test', 'test prefixed values 1');
        get(db, prefix + 'test', 'test', 'test prefixed values 2');
        get(db, prefix + prefix2 + 'test', 'test', 'test prefixed values 3');
      });

      putAndGet(db, 'test', 'test', 'db', nextTest);
      putAndGet(preDb, 'test', 'test', 'preDb', nextTest);
      putAndGet(nestedDb, 'test', 'test', 'nestedDb', nextTest);
    });
  });
});
