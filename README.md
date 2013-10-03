
# level-prefix

This is a work in progress for a lighter level-sublevel. Feedback is appreciated!

[![build status](https://secure.travis-ci.org/juliangruber/level-prefix.png)](http://travis-ci.org/juliangruber/level-prefix)

## Example

```js
var level = require('level');
var pre = require('level-prefix');

var db = pre(level(__dirname + '/db'));

db
.prefix('foo')
.prefix('bar')
.put('key', 'value', function(err) {
  if (err) throw err;
  db.createKeyStream().on('data', console.log);
  // => foobarkey
});
```

## API

### db = pre(db)

### preDB = db.prefix(prefix)

## Installation

With [npm](https://npmjs.org) do:

```bash
npm install level-prefix
```

## License

(MIT)

Copyright (c) 2013 Julian Gruber &lt;julian@juliangruber.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
