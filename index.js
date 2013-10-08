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
      if (!endSet && end.indexOf(prop) > -1) {
        endSet = true;
      }
    }
  });

  if (!startSet) opts.start = prefix;
  if (!endSet) opts.end = prefix + '\xff';

  return this.db.createReadStream(opts);
};

Pre.prototype.keyStream =
Pre.prototype.createKeyStream = function(options) {
  return this.db.createKeyStream.call(this, options);
};

Pre.prototype.valueStream =
Pre.prototype.createValueStream = function(options) {
  return this.db.createValueStream.call(this, options);
};

Pre.prototype.writeStream =
Pre.prototype.createWriteStream = function(opts) {
  var prefix = this._prefix;

  var tr = new Transform({ objectMode: true });
  tr._transform = function(obj, enc, done) {
    obj.key = prefix + obj.key;

    done(null, obj);
  }

  tr._flush = function() {
    // emit 'close' event, to maintain compatibility with the LevelUp API
    this.emit('close');
  }

  var ws = this.db.createWriteStream(opts);

  tr.pipe(ws);

  return tr;
}

Pre.prototype.batch = function(ops, options, cb) {
  var prefix = this._prefix;

  if (!arguments.length) {
    return this._decorateChainedBatch(this.db.batch());
  }

  ops.forEach(function(op) {
    op.key = prefix + op.key;
  });

  this.db.batch(ops, options, cb);
};

Pre.prototype._decorateChainedBatch = function(batch) {
  var prefix  = this._prefix;
  var methods = ['put', 'del'];

  methods.forEach(function(method) {
    var original = batch[method];

    batch[method] = function() {
      var args = Array.prototype.slice.call(arguments);
      args[0] = prefix + args[0];
      return original.apply(batch, args);
    };
  });

  return batch;
};

Pre.prototype.prefix = function(name) {
  return new Pre(this.db, this._prefix + name);
};

