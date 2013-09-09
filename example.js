var level = require('level');
var pre = require('./');

var db = pre(level(__dirname + '/db'));

db
.prefix('foo')
.prefix('bar')
.put('key', 'value', function(err) {
  if (err) throw err;
  db.createKeyStream().on('data', console.log);
});
