'use strict';
// STREAMS: Readable, Transform, Writable, pipeline, and file streams
const { Readable, Transform, Writable, pipeline } = require('stream');
const fs = require('fs');
const os = require('os');
const path = require('path');

const names = ['asha', 'ravi', 'meena', 'karthik'];
const source = Readable.from(names);                                              // Readable
const upper = new Transform({ transform(c, _e, cb) { cb(null, c.toString().toUpperCase() + '\n'); } });   // Transform
const tmp = path.join(os.tmpdir(), 'students-stream.txt');

pipeline(source, upper, fs.createWriteStream(tmp), (err) => {                     // Writable (file)
  if (err) return console.error('pipeline failed', err);
  console.log('written to', tmp);
  let bytes = 0;
  fs.createReadStream(tmp, { highWaterMark: 4 })                                  // tiny chunks to show chunking
    .on('data', (chunk) => { bytes += chunk.length; console.log('chunk:', JSON.stringify(chunk.toString())); })
    .on('end', () => { console.log('read', bytes, 'bytes'); fs.unlinkSync(tmp); })
    .on('error', (e) => console.error(e.message));
});
