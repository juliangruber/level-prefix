var level = require('level');
var pre = require('../');
var db = pre(level('/tmp/sample-level-prefix.db'));

db
.prefix('foo')
.prefix('bar')
.put('key', 'value', function(err) {
  if (err) throw err;
  db.createKeyStream().on('data', console.log);
});

