var Transform = require('stream').Transform;
var Duplex = require('stream').Duplex;

module.exports = install;

function install(db) {
  db.prefix = function(prefix) {
    return new Pre(db, prefix);
  }
  return db;
}

function Pre(db, prefix) {
  if (!(this instanceof Pre)) return new Pre(db, prefix);
  this.db = db;
  this._prefix = prefix;
}

Pre.prototype.get = function() {
  arguments[0] = this._prefix + arguments[0];
  this.db.get.apply(this.db, arguments);
};

Pre.prototype.put = function() {
  arguments[0] = this._prefix + arguments[0];
  this.db.put.apply(this.db, arguments);
};

Pre.prototype.del = function() {
  arguments[0] = this._prefix + arguments[0];
  this.db.del.apply(this.db, arguments);
};

var start = ['start', 'gt', 'gte'];
var end = ['end', 'lt', 'lte'];
var props = start.concat(end);

Pre.prototype.readStream =
Pre.prototype.createReadStream = function(opts) {
  var prefix = this._prefix;
  var startSet = false;
  var endSet = false;
  opts = opts || {};

  Object.keys(opts).forEach(function(prop) {
    if (props.indexOf(prop) > -1) {
      opts[prop] = prefix + opts[prop];
      if (!startSet && start.indexOf(prop) > -1) {
        startSet = true;
      }
      if (!startSet && end.indexOf(prop) > -1) {
        endSet = true;
      }
    }
  });

  if (!startSet) opts.start = prefix;
  if (!endSet) opts.end = prefix + '\xff';

  return this.db.createReadStream(opts);
};

Pre.prototype.writeStream =
Pre.prototype.createWriteStream = function(opts) {
  var prefix = this._prefix;
  var tr = Transform({ objectMode: true });
  tr._transform = function(obj, enc, done) {
    obj.key = prefix + obj.key;
    done(null, obj);
  }
  var dpl = Duplex({ objectMode: true });
  var ws = this.db.createWriteStream(opts);
  dpl.pipe(tr).pipe(ws).pipe(dpl);
  return dpl;
};

Pre.prototype.prefix = function(name) {
  return new Pre(this.db, this._prefix + name);
};

