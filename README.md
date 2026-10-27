# Student Information Management System (Node.js)

A zero-dependency Node.js project (built-in modules only, Node 18+) that manages student records
and demonstrates the core Node.js concepts. **No `npm install` required.**

## Quick start
```bash
npm start                 # web app at http://localhost:3000
npm start -- --port 4000  # custom port (command-line option)
npm run certs && npm run start:https   # TLS/SSL server at https://localhost:3000
npm test                  # assertion-based tests
npm run repl              # interactive REPL
node cli.js --help        # command-line interface
```

## Web module (Add / Display / Search / Update / Delete)
Open http://localhost:3000. REST API:

| Action  | Request                                   |
|---------|-------------------------------------------|
| Add     | `POST /api/students` (JSON or form data)  |
| Display | `GET /api/students`, `GET /api/students/:id` |
| Search  | `GET /api/students?search=asha&department=CSE` |
| Update  | `PUT /api/students/:id`                   |
| Delete  | `DELETE /api/students/:id`                |
| Extras  | `GET /api/stats` (OS info), `GET /api/backup` (gzip stream) |

Data is stored in `data/students.json`.

## CLI
```bash
node cli.js add --roll CS300 --name "Meena" --email m@x.com --dept CSE --year 1
node cli.js list
node cli.js search --q meena
node cli.js update --id <id> --year 2
node cli.js delete --id <id>
node cli.js export --out students.csv
node cli.js backup --out students.json.gz
```

## Where each concept is demonstrated
| Concept | Location |
|---|---|
| Console | `console.log/error/table` everywhere; `lib/logger.js`, `cli.js` |
| REPL | `repl.js` (custom `.count`, `.add` commands, store preloaded) |
| NPM | `package.json` scripts, metadata, engines (`npm run <script>`) |
| Command-line options | `cli.js`, `server.js` (`util.parseArgs`, `process.argv`) |
| OS module | `demos/os-demo.js`, `GET /api/stats` |
| Timer module | `demos/timers-demo.js`, graceful-shutdown timeout in `server.js` |
| Error handling | `lib/errors.js`, `demos/errors-demo.js`, try/catch in `server.js` |
| DNS & Crypto | `demos/dns-crypto-demo.js` (hash, HMAC, PBKDF2, AES-GCM) |
| TLS/SSL | `demos/tls-demo.js`, `node server.js --https`, `scripts/gen-certs.sh` |
| Debugger | `demos/debug-demo.js` -> `npm run debug` |
| Process | `demos/process-demo.js`, signals/exit handlers in `server.js` |
| Child process | `demos/child-demo.js` (exec, execFile, spawn, fork + `worker.js`) |
| Buffers | `demos/buffer-demo.js`, response bodies in `server.js` |
| Streams | `demos/streams-demo.js`, static files, backup (gzip), CSV export |
| File system | `lib/studentStore.js` (fs.promises, atomic write, callback API) |
| String decoder | `server.js` `readBody()`, `demos/decoder-demo.js` |
| Query string | `server.js` (URL query + form bodies), `demos/decoder-demo.js` |
| Assertion | `lib/validators.js`, `test/store.test.js` |
| Callbacks & Events | `StudentStore` extends `EventEmitter`; `getAllCb()`; `demos/events-demo.js` |

## Debugging tips
```bash
npm run debug                         # CLI debugger: n, s, o, c, repl, .exit
node --inspect-brk server.js          # then open chrome://inspect
```

## Project layout
```
server.js  cli.js  repl.js  package.json
lib/       errors.js  validators.js  logger.js  studentStore.js
public/    index.html
demos/     one file per concept
test/      store.test.js
certs/     self-signed dev certificate (regenerate with npm run certs)
data/      students.json
```
> The certificate in `certs/` is for local development only; never use it in production.
