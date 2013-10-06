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

    db     = level(path);
    prefix = 'ns-';
    preDb  = pre(db).prefix(prefix);
    next   = after(4, cb);

    // sample data
    db.put('test', 'foo', next);
    db.put(prefix + 'to_delete', 'foo', next);
    db.put(prefix + 'to_update', 'foo', next);
    db.put(prefix + 'to_remain', 'foo', next);
  }

  setup(function(err) {
    if (err) { throw err; }

    test('batch array', function(t) {
      var ops;

      ops = [
        {
          type : 'del',
          key  : 'to_delete'
        },
        {
          type  : 'put',
          key   : 'to_update',
          value : 'updated'
        }
      ];

      for (var i = 0; i < 10; i++) {
        ops.push({
          type   : 'put',
          key    : ['next', i].join(''),
          value  : ['val', i].join('')
        });
      }

      preDb.batch(ops, function(err) {
        var data = {};

        t.error(err);

        preDb.createReadStream().on('data', function(item) {
          data[item.key] = item.value;
        }).on('end', function() {
          t.equal(typeof data[prefix + 'to_delete'], 'undefined');
          t.equal(data[prefix + 'to_update'], 'updated');
          t.equal(data[prefix + 'to_remain'], 'foo');

          for (var i = 0; i < 9; i++) {
            t.equal(data[prefix + 'next' + i], 'val' + i);
          }

          t.equal(Object.keys(data).length, 12);

          t.end();
        });
      });

    });
  });
});

