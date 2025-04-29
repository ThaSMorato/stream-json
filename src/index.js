// @ts-self-types="./index.d.ts"

'use strict';

const parser = require('./parser.js');
const emit = require('./utils/emit.js');

const make = options => emit(parser.asStream(options));

const filters = require('./filters/index.js');
const jsonl = require('./jsonl/index.js');
const streamers = require('./streamers/index.js');
const utils = require('./utils/index.js');

module.exports = make;
module.exports.parser = parser;
module.exports.filters = filters;
module.exports.jsonl = jsonl;
module.exports.streamers = streamers;
module.exports.utils = utils;
