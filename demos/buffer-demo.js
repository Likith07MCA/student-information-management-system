'use strict';
// BUFFERS
const b1 = Buffer.from('Hello Students', 'utf8');
console.log(b1, '|', b1.length, 'bytes');
console.log('hex    :', b1.toString('hex'));
console.log('base64 :', b1.toString('base64'));
console.log('slice  :', b1.subarray(0, 5).toString());
const b2 = Buffer.alloc(8); b2.writeUInt32BE(2026, 0); b2.writeUInt16LE(99, 4);
console.log('binary :', b2, '-> read back', b2.readUInt32BE(0), b2.readUInt16LE(4));
console.log('concat :', Buffer.concat([Buffer.from('Roll:'), Buffer.from('CS101')]).toString());
console.log('equals :', Buffer.from('a').equals(Buffer.from('a')), '| compare:', Buffer.compare(Buffer.from('a'), Buffer.from('b')));
console.log('byteLength of "नमस्ते":', Buffer.byteLength('नमस्ते'), 'bytes vs', 'नमस्ते'.length, 'chars');
console.log('JSON   :', JSON.stringify(Buffer.from('hi')));
