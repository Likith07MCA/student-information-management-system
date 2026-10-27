'use strict';
// WEB MODULE: Add / Display / Search / Update / Delete students over HTTP (or HTTPS with --https).
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const zlib = require('zlib');
const { pipeline } = require('stream');
const { StringDecoder } = require('string_decoder');
const querystring = require('querystring');
const { parseArgs } = require('util');

const { store } = require('./lib/studentStore');
const { AppError } = require('./lib/errors');
const logger = require('./lib/logger');

// COMMAND-LINE OPTIONS:  node server.js --port 4000 --https
const { values: opts } = parseArgs({
  options: { port: { type: 'string', short: 'p' }, https: { type: 'boolean' }, help: { type: 'boolean', short: 'h' } },
  allowPositionals: true,
});
if (opts.help) { console.log('Usage: node server.js [--port 3000] [--https]'); process.exit(0); }
const PORT = Number(opts.port || process.env.PORT || 3000);

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };
const PUBLIC = path.join(__dirname, 'public');

// EVENTS: react to store events
store.on('added', (s) => logger.info(`Student added: ${s.rollNo} ${s.name}`));
store.on('updated', (s) => logger.info(`Student updated: ${s.rollNo}`));
store.on('deleted', (s) => logger.info(`Student deleted: ${s.rollNo}`));

const send = (res, code, data) => {
  const body = Buffer.from(JSON.stringify(data));                 // BUFFER
  res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': body.length });
  res.end(body);
};

// STREAM + STRING DECODER: safely decode multi-byte characters split across chunks
function readBody(req, limit = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const decoder = new StringDecoder('utf8');
    let body = '', size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) { reject(new AppError('Payload too large', 413, 'E_SIZE')); req.destroy(); return; }
      body += decoder.write(chunk);
    });
    req.on('end', () => {
      body += decoder.end();
      if (!body) return resolve({});
      try {
        // QUERY STRING: form posts are parsed with querystring, JSON with JSON.parse
        resolve(/json/.test(req.headers['content-type'] || '') ? JSON.parse(body) : querystring.parse(body));
      } catch { reject(new AppError('Malformed request body', 400, 'E_BODY')); }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res, pathname) {
  const file = path.normalize(path.join(PUBLIC, pathname === '/' ? 'index.html' : pathname));
  if (!file.startsWith(PUBLIC)) throw new AppError('Forbidden', 403, 'E_FORBIDDEN');
  const stream = fs.createReadStream(file);
  stream.on('open', () => res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' }));
  stream.on('error', () => send(res, 404, { error: 'Not found' }));
  stream.pipe(res);
}

async function handleApi(req, res, url) {
  const query = querystring.parse(url.search.slice(1));           // ?search=ali&department=CSE
  const parts = url.pathname.split('/').filter(Boolean);          // ['api','students',':id']
  const id = parts[2];

  if (parts[1] === 'stats') {                                     // OS MODULE
    return send(res, 200, { host: os.hostname(), platform: os.platform(), cpus: os.cpus().length,
      freeMemMB: Math.round(os.freemem() / 1048576), uptimeSec: Math.round(process.uptime()), students: (await store.list()).length });
  }
  if (parts[1] === 'backup') {                                    // STREAMS: gzip the data file straight to the client
    res.writeHead(200, { 'Content-Type': 'application/gzip', 'Content-Disposition': 'attachment; filename=students.json.gz' });
    return pipeline(fs.createReadStream(store.file), zlib.createGzip(), res, (e) => e && logger.error('Backup failed: ' + e.message));
  }
  if (parts[1] !== 'students') throw new AppError('Unknown API route', 404, 'E_ROUTE');

  switch (req.method) {
    case 'GET':    return send(res, 200, id ? await store.get(id) : await store.list(query));   // display + search
    case 'POST':   return send(res, 201, await store.add(await readBody(req)));                  // add
    case 'PUT':    return send(res, 200, await store.update(id, await readBody(req)));           // update
    case 'DELETE': return send(res, 200, await store.remove(id));                                // delete
    default: throw new AppError('Method not allowed', 405, 'E_METHOD');
  }
}

async function requestListener(req, res) {
  const started = process.hrtime.bigint();
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) await handleApi(req, res, url);
    else serveStatic(req, res, url.pathname);
  } catch (err) {                                                 // ERROR HANDLING
    const code = err.statusCode || 500;
    if (code >= 500) logger.error(`${req.method} ${req.url} -> ${err.stack}`);
    if (!res.headersSent) send(res, code, { error: err.message, code: err.code || 'E_INTERNAL' });
  } finally {
    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    logger.info(`${req.method} ${req.url} ${res.statusCode} ${ms.toFixed(1)}ms`);
  }
}

// TLS/SSL: pass --https to serve over TLS with the self-signed cert in ./certs
let server;
if (opts.https) {
  try {
    server = https.createServer({ key: fs.readFileSync('certs/key.pem'), cert: fs.readFileSync('certs/cert.pem') }, requestListener);
  } catch (e) { console.error('Could not load certs. Run "npm run certs" first.', e.message); process.exit(1); }
} else server = http.createServer(requestListener);

server.on('error', (e) => {
  console.error(e.code === 'EADDRINUSE' ? `Port ${PORT} already in use. Try --port ${PORT + 1}` : e.message);
  process.exit(1);
});
server.listen(PORT, () => logger.info(`Server running at ${opts.https ? 'https' : 'http'}://localhost:${PORT}`));

// PROCESS: global error handling and graceful shutdown
process.on('uncaughtException', (e) => { logger.error('uncaughtException: ' + e.stack); });
process.on('unhandledRejection', (r) => { logger.error('unhandledRejection: ' + r); });
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    logger.info(`${sig} received, shutting down...`);
    server.close(async () => { await logger.close(); process.exit(0); });
    setTimeout(() => process.exit(1), 3000).unref();             // TIMER: force exit if close hangs
  });
}
module.exports = server;
