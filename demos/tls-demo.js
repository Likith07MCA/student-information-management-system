'use strict';
// TLS/SSL: a raw TLS server + client using the self-signed certificate (run "npm run certs" if missing).
const tls = require('tls');
const fs = require('fs');
let key, cert;
try { key = fs.readFileSync('certs/key.pem'); cert = fs.readFileSync('certs/cert.pem'); }
catch { console.error('Certificates missing. Run: npm run certs'); process.exit(1); }

const server = tls.createServer({ key, cert }, (socket) => {
  console.log('[server] client connected, authorized =', socket.authorized);
  socket.on('data', (d) => { console.log('[server] received:', d.toString().trim()); socket.end('Hello over TLS!\n'); });
});
server.listen(8443, () => {
  const client = tls.connect({ port: 8443, host: 'localhost', ca: cert, servername: 'localhost' }, () => {
    console.log('[client] connected. authorized =', client.authorized);
    console.log('[client] protocol:', client.getProtocol(), '| cipher:', client.getCipher().name);
    const c = client.getPeerCertificate();
    console.log('[client] cert subject:', c.subject.CN, '| valid to:', c.valid_to);
    client.write('Student record request\n');
  });
  client.on('data', (d) => console.log('[client] received:', d.toString().trim()));
  client.on('end', () => server.close());
  client.on('error', (e) => { console.error('[client] TLS error:', e.message); server.close(); });
});
