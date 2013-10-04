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
    next    = after(12, cb);

    for (i = 0; i < 10; i++) {
      db.put(prefix + i, 'prefixed-' + i, next);
    }

    // insert some non-prefixed values
    db.put('foo', 'original-1', next);
    db.put('foo2', 'original-2', next);
  }

  setup(function(err) {
    if (err) { throw err; }

    test('keyStream && valueStream', function(t) {
      var checkKeyStream, checkValueStream;

      function checkStream(type) {
        return function(dbInstance, opts, params) {
          var data = [];

          dbInstance['create' + type + 'Stream'](opts).on('data', function(item) {
            data.push(item);
          }).on('end', function() {
            var ok = true;

            t.equal(params.count, data.length, params.assertMsg);
            data.forEach(function(item) {
              if (!params.pattern.test(item)) {
                ok = false;
              }
            });
            t.equal(ok, true, params.assertMsg);
          });
        }
      }

      checkKeyStream   = checkStream('Key');
      checkValueStream = checkStream('Value');

      t.plan(12);

      // 10 values are prefixed and 2 aren't
      checkKeyStream(db, {}, {
        count     : 12,
        assertMsg : 'db.createKeyStream() no opts',
        pattern   : /^(foo|ns)/
      });
      checkKeyStream(preDb, {}, {
        count     : 10,
        assertMsg : 'preDb.createKeyStream() no opts',
        pattern   : /^ns-/
      });
      checkKeyStream(preDb, {
        start : '6',
        end   : '8',
      }, {
        count     : 3,
        assertMsg : 'preDb.createKeyStream() with opts',
        pattern   : /^ns-/
      });

      checkValueStream(db, {}, {
        count     : 12,
        assertMsg : 'db.createValueStream() no opts',
        pattern   : /^(prefixed|original)/
      });
      checkValueStream(preDb, {}, {
        count     : 10,
        assertMsg : 'preDb.createValueStream() no opts',
        pattern   : /^prefixed-/
      });
      checkValueStream(preDb, {
        start : '6',
        end   : '8',
      }, {
        count     : 3,
        assertMsg : 'preDb.createValueStream() with opts',
        pattern   : /^prefixed-/
      });

    });
  });
});

