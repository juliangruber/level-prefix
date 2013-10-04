var pre    = require('../'),
    level  = require('level'),
    test   = require('tape'),
    rimraf = require('rimraf'),
    after  = require('after'),
    db, path, preDb, prefix;

path = '/tmp/test-level-prefix';

rimraf(path, function(err) {
  if (err) { throw err; }

  function setup(cb) {
    var next;

    db      = level(path);
    prefix  = 'ns-';
    preDb   = pre(db).prefix(prefix);
    next    = after(2, cb);

    db.put(prefix + 'foo', 'JoeBar', next);
    db.put('bar', 'JoeBar', next);
  }

  setup(function(err) {
    if (err) { throw err; }

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
