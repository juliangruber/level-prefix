var level = require('level');
var pre   = require('../');
var db    = pre(level('/tmp/sample-level-prefix.db'));
var Users = db.prefix('users-');

Users.batch()
  .put('Alex', 'contributor')
  .put('Julian', 'owner')
  .put('Guest', 'guest')
  .write(function(err) {
    if (err) { throw err; }

    output('batch 1', function() {
      // and let's try to delete and add stuff
      Users.batch()
        .del('Alex')
        .del('Guest')
        .put('substack', 'keymaster')
        .write(function(err) {
          if (err) { throw err; }

          output('batch 2');
        });
    });
  });

// reads everything stored into levelDb (the 'parent' database)
function output(title, cb) {
  cb = cb || function() {};

  console.log('');
  console.log('==== After ' + title.toUpperCase() + ' ====');
  console.log('');

  db.createReadStream().on('data', function(item) {
    console.log('key: ' + item.key);
    console.log('value: ' + item.value);
    console.log('--------------------');
  }).on('end', function() {
    cb();
  });

}
