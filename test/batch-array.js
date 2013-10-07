var pre = require('../');
var level = require('level');
var test = require('tape');
var rimraf = require('rimraf');
var path = '/tmp/test-level-prefix';

test('batch array', function(t) {
  t.plan(14);
  rimraf.sync(path);

  var db = level(path);
  var prefix = 'ns-';
  var preDb = pre(db).prefix(prefix);

  db.put('test', 'foo');
  db.put(prefix + 'to_delete', 'foo');
  db.put(prefix + 'to_update', 'foo');
  db.put(prefix + 'to_remain', 'foo');

  var ops = [
    { type: 'del', key: 'to_delete' },
    { type: 'put', key: 'to_update', value: 'updated' }
  ];

  for (var i = 0; i < 10; i++) {
    ops.push({
      type: 'put',
      key: ['next', i].join(''),
      value: ['val', i].join('')
    });
  }

  preDb.batch(ops, function(err) {
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

