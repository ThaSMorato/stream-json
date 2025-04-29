const parser = require('./parser.js');
const stringer = require('./stringer.js');

module.exports = {
  ...parser,
  ...stringer
}
