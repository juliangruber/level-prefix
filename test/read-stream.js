var pre    = require('../'),
    level  = require('level'),
    test   = require('tape'),
    rimraf = require('rimraf'),
    db, path, preDb, prefix;

path = '/tmp/test-level-prefix';

rimraf(path, function(err) {
  if (err) { throw err; }

  function setup(cb) {
    var counter;

    db      = level(path);
    prefix  = 'ns-';
    preDb   = pre(db).prefix(prefix);
    counter = 12;

    function after(err) {
      if (err) { throw err; }

      if (!--counter) { cb(); }
    }

    for (i = 0; i < 10; i++) {
      db.put(prefix + i, 'JoeBar', after);
    }

    // insert some non-prefixed values
    db.put('foo', 'bar', after);
    db.put('baz', 'bz', after);
  }

  setup(function() {
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
