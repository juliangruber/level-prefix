var pre = require('../');
var level = require('level');
var test = require('tape');
var rimraf = require('rimraf');
var path = '/tmp/test-level-prefix';
var after = require('after');

test('writeStream', function(t) {
  t.plan(2);
  rimraf.sync(path);

  var db = level(path);
  var prefix = 'ns-';
  var preDb = pre(db).prefix(prefix);

  db.put('foo', 'bar');
  db.put('baz', 'bz');
  db.put(prefix + 'foo', 'bar');
  db.put(prefix + 'baz', 'bz');

  function checkReadStream(dbInstance, count, assertMsg) {
    dbInstance.createReadStream().on('data', function() {
      count--;
    }).on('end', function() {
      t.equal(count, 0, assertMsg);
    });
  }

  var next = after(2, function(err) {
    checkReadStream(db, 8, 'db.createWriteStream()');
    checkReadStream(preDb, 4, 'preDb.createWriteStream()');
  });

  var wsDb = db.createWriteStream();
  var wsPre = preDb.createWriteStream();

  wsDb.write({ type: 'put', key: 'name', value: 'John' });
  wsDb.write({ type: 'put', key: 'name2', value: 'Matt' });
  wsDb.write({ type: 'put', key: 'name3', value: 'Abe' });
  wsDb.write({ type: 'del', key: 'foo' });

  wsPre.write({ type: 'put', key: 'job', value: 'web designer' });
  wsPre.write({ type: 'put', key: 'job2', value: 'artist' });
  wsPre.write({ type: 'put', key: 'job3', value: 'politician' });
  wsPre.write({ type: 'del', key: 'baz' });

  wsPre.on('close', next);
  wsDb.on('close', next);

  wsPre.end();
  wsDb.end();

});
