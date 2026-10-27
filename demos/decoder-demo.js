'use strict';
// STRING DECODER + QUERY STRING
const { StringDecoder } = require('string_decoder');
const querystring = require('querystring');

const euro = Buffer.from('€');                          // 3 bytes: e2 82 ac
const part1 = euro.subarray(0, 2), part2 = euro.subarray(2);
console.log('naive toString :', part1.toString() + part2.toString());   // broken characters
const dec = new StringDecoder('utf8');
console.log('StringDecoder  :', dec.write(part1) + dec.write(part2) + dec.end());   // "€"

console.log('\n--- querystring ---');
console.log(querystring.parse('name=Asha+Rao&dept=CSE&year=2&tag=a&tag=b'));
console.log(querystring.stringify({ search: 'john doe', department: 'IT', year: 3 }));
console.log(querystring.escape('a b&c=d'), '|', querystring.unescape('a%20b%26c'));
