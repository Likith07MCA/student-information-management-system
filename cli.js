#!/usr/bin/env node
'use strict';
// COMMAND-LINE OPTIONS: manage students from the terminal.
//   node cli.js add --roll CS101 --name "Asha" --email a@x.com --dept CSE --year 2
const fs = require('fs');
const { Transform, pipeline } = require('stream');
const zlib = require('zlib');
const { parseArgs } = require('util');
const { store } = require('./lib/studentStore');

const { values: v, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    id: { type: 'string' }, roll: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' },
    dept: { type: 'string' }, year: { type: 'string' }, q: { type: 'string' }, out: { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
});
const [cmd] = positionals;
const HELP = `Student CLI
  add     --roll --name --email --dept --year
  list
  search  --q text
  update  --id ID [--roll --name --email --dept --year]
  delete  --id ID
  export  [--out students.csv]       (stream -> CSV)
  backup  [--out students.json.gz]   (stream -> gzip)`;

async function main() {
  if (!cmd || v.help) return console.log(HELP);
  switch (cmd) {
    case 'add':
      return console.log('Added:', await store.add({ rollNo: v.roll, name: v.name, email: v.email, department: v.dept, year: v.year }));
    case 'list':
      return console.table(await store.list());
    case 'search':
      return console.table(await store.list({ search: v.q }));
    case 'update': {
      if (!v.id) throw new Error('--id is required');
      const d = { rollNo: v.roll, name: v.name, email: v.email, department: v.dept, year: v.year };
      Object.keys(d).forEach((k) => d[k] === undefined && delete d[k]);
      return console.log('Updated:', await store.update(v.id, d));
    }
    case 'delete':
      if (!v.id) throw new Error('--id is required');
      return console.log('Deleted:', await store.remove(v.id));
    case 'export': {
      const rows = await store.list();
      const toCsv = new Transform({                         // Transform stream
        writableObjectMode: true,
        transform(s, _e, cb) { cb(null, [s.id, s.rollNo, s.name, s.email, s.department, s.year].map((x) => `"${x}"`).join(',') + '\n'); },
      });
      const out = fs.createWriteStream(v.out || 'students.csv');
      pipeline(toCsv, out, (e) => (e ? console.error(e.message) : console.log(`Exported ${rows.length} rows`)));
      toCsv.write({ id: 'id', rollNo: 'rollNo', name: 'name', email: 'email', department: 'department', year: 'year' });
      rows.forEach((r) => toCsv.write(r));
      return toCsv.end();
    }
    case 'backup':
      return pipeline(fs.createReadStream(store.file), zlib.createGzip(), fs.createWriteStream(v.out || 'students.json.gz'),
        (e) => (e ? console.error('Backup failed:', e.message) : console.log('Backup written')));
    default:
      console.log(`Unknown command "${cmd}"\n${HELP}`); process.exitCode = 1;
  }
}
main().catch((e) => { console.error(`Error [${e.code || 'ERR'}]: ${e.message}`); process.exitCode = 1; });
