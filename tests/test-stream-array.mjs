'use strict';

import test from 'tape-six';
import chain from '@thasmorato/stream-chain';

import streamArray from '../src/streamers/stream-array.js';

import readString from './read-string.mjs';

test.asPromise('parser: stream array', (t, resolve, reject) => {
  const pattern = [0, 1, true, false, null, {}, [], { a: 'b' }, ['c']],
    result = [],
    pipeline = chain([readString(JSON.stringify(pattern)), streamArray.withParser()]);

  pipeline.on('data', object => (result[object.key] = object.value));
  pipeline.on('error', reject);
  pipeline.on('end', () => {
    t.deepEqual(result, pattern);
    resolve();
  });
});

test.asPromise('parser: stream array - fail', (t, resolve, reject) => {
  const stream = streamArray.withParserAsStream();

  stream.on('data', value => t.fail("We shouldn't be here."));
  stream.on('error', e => {
    t.ok(e);
    resolve();
  });
  stream.on('end', value => {
    t.fail("We shouldn't be here.");
    reject();
  });

  readString(' true ').pipe(stream);
});

test.asPromise('parser: stream - array filter', (t, resolve, reject) => {
  const f = assembler => {
    if (assembler.depth == 2 && assembler.key === null) {
      if (assembler.current instanceof Array) {
        return false; // reject
      }
      switch (assembler.current.a) {
        case 'accept':
          return true; // accept
        case 'reject':
          return false; // reject
      }
    }
    // undecided
  };

  const stream = streamArray.withParserAsStream({ objectFilter: f }),
    input = [
      0,
      1,
      true,
      false,
      null,
      {},
      [],
      { a: 'reject', b: [[[]]] },
      ['c'],
      { a: 'accept' },
      { a: 'neutral' },
      { x: true, a: 'reject' },
      { y: null, a: 'accept' },
      { z: 1234, a: 'neutral' },
      { w: '12', a: 'neutral' }
    ],
    result = [];

  stream.on('data', object => result.push(object.value));
  stream.on('error', reject);
  stream.on('end', () => {
    result.forEach(o => {
      if (typeof o == 'object' && o) {
        t.notOk(o instanceof Array);
        t.equal(o.a, 'accept');
      } else {
        t.fail("We shouldn't be here.");
      }
    });
    resolve();
  });

  readString(JSON.stringify(input)).pipe(stream);
});

test.asPromise('parser: stream array - filter include undecided', (t, resolve, reject) => {
  const f = assembler => {
    if (assembler.depth == 2 && assembler.key === null) {
      if (assembler.current instanceof Array) {
        return false; // reject
      }
      switch (assembler.current.a) {
        case 'accept':
          return true; // accept
        case 'reject':
          return false; // reject
      }
    }
    // undecided
  };

  const stream = streamArray.withParserAsStream({ objectFilter: f, includeUndecided: true }),
    input = [
      0,
      1,
      true,
      false,
      null,
      {},
      [],
      { a: 'reject', b: [[[]]] },
      ['c'],
      { a: 'accept' },
      { a: 'neutral' },
      { x: true, a: 'reject' },
      { y: null, a: 'accept' },
      { z: 1234, a: 'neutral' },
      { w: '12', a: 'neutral' }
    ],
    result = [];

  stream.on('data', object => result.push(object.value));
  stream.on('error', reject);
  stream.on('end', () => {
    result.forEach(o => {
      if (typeof o == 'object' && o) {
        t.notOk(o instanceof Array);
        t.notEqual(o.a, 'reject');
      } else {
        t.ok(o === null || typeof o != 'object');
      }
    });
    resolve();
  });

  readString(JSON.stringify(input)).pipe(stream);
});

test.asPromise('parser: stream array - replacer and reviver', (t, resolve, reject) => {
  const reviver = (k, v) => {
    if (/Date$/.test(k) && typeof v == 'string') return new Date(Date.parse(v));
    return v;
  };

  const source = [{ createdDate: new Date(), updatedDate: new Date(), user: 'bob', life: 42 }],
    json = JSON.stringify(source);

  const stream = streamArray.withParserAsStream({ reviver }),
    result = [];

  stream.on('data', object => result.push(object.value));
  stream.on('error', reject);
  stream.on('end', () => {
    t.deepEqual(result, source);
    resolve();
  });

  readString(json).pipe(stream);
});
