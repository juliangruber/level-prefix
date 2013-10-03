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
    counter = 2;

    function after(err) {
      if (err) { throw err; }

      if (!--counter) { cb(); }
    }

    db.put(prefix + 'foo', 'JoeBar', after);
    db.put('bar', 'JoeBar', after);
  }

  setup(function() {
    test('del', function(t) {
      t.plan(4);

      function delAndCheck(dbInstance, key, assertMsg) {
        dbInstance.del(key, function(err) {
          t.error(err);

          dbInstance.get(key, function(err) {
            t.ok(err && err.notFound);
          });
        });
      }

      delAndCheck(preDb, 'foo', 'preDb.del()');
      // make sure db.del() works like before prefixing
      delAndCheck(db, (prefix + 'foo'), 'db.del()');
    });
  });
});
