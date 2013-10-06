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
    var next;

    db      = level(path);
    prefix  = 'ns-';
    preDb   = pre(db).prefix(prefix);
    next    = after(12, cb);

    for (i = 0; i < 10; i++) {
      db.put(prefix + i, 'JoeBar', next);
    }

    // insert some non-prefixed values
    db.put('foo', 'bar', next);
    db.put('baz', 'bz', next);
  }

  setup(function(err) {
    if (err) { throw err; }

    test('readStream', function(t) {
      t.plan(3);

      function checkReadStream(dbInstance, opts, count, assertMsg) {
        var _count = 0;

        dbInstance.createReadStream(opts).on('data', function() {
          _count++;
        }).on('end', function() {
          t.equal(count, _count, assertMsg);
        });
      }

      // 10 values are prefixed and 2 are'n
      checkReadStream(db, {}, 12, 'db.createReadStream() no opts');
      checkReadStream(preDb, {}, 10, 'preDb.createReadStream() no opts');
      checkReadStream(preDb, {
        start : '6',
        end   : '8',
      }, 3, 'preDb.createReadStream with opts');
    });
  });
});
