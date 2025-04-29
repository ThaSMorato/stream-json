const streamArray = require('./stream-array.js');
const streamObject = require('./stream-object.js');
const streamValues = require('./stream-values.js');
const streamBase = require('./stream-base.js');

module.exports = {
  ...streamArray,
  ...streamObject,
  ...streamValues,
  ...streamBase
};
