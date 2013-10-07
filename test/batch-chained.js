var pre    = require('../');
var level  = require('level');
var test   = require('tape');
var rimraf = require('rimraf');
var path = '/tmp/test-level-prefix';

test('batch chained', function(t) {
  t.plan(14);
  rimraf.sync(path);

  var db = level(path);
  var prefix = 'ns-';
  var preDb = pre(db).prefix(prefix);

  db.put('test', 'foo');
  db.put(prefix + 'to_delete', 'foo');
  db.put(prefix + 'to_update', 'foo');
  db.put(prefix + 'to_remain', 'foo');

  var batch = preDb.batch()
    .del('to_delete')
    .put('to_update', 'updated');

  for (var i = 0; i < 10; i++) {
    batch.put('next' + i, 'val' + i);
  }

  batch.write(function(err) {
    t.error(err);
    var data = {};

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
    });
  });
});

