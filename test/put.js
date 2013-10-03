var pre    = require('../'),
    level  = require('level'),
    test   = require('tape'),
    rimraf = require('rimraf'),
    db, path, preDb, prefix;

path = '/tmp/test-level-prefix';

rimraf(path, function(err) {
  if (err) { throw err; }

  function setup(cb) {
    db     = level(path);
    prefix = 'ns-';
    preDb = pre(db).prefix(prefix);

    cb();
  }

  setup(function() {
    test('put', function(t) {
      t.plan(6);

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
      // make sure db.put() works like before prefixing
      putAndCheck(db, 'foo2', 'bar2', 'db.put()');
    });
  });
});
