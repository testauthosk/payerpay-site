// Минимальный статик-сервер для Railway (без зависимостей).
const http = require('http'), fs = require('fs'), path = require('path');
const port = process.env.PORT || 3000, root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff2': 'font/woff2' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/' || p.endsWith('/')) p += 'index.html';
  const f = path.normalize(path.join(root, p));
  if (!f.startsWith(root)) { res.writeHead(403); return res.end('403'); }
  fs.readFile(f, (e, data) => {
    if (e) { // фолбэк на index.html
      fs.readFile(path.join(root, 'index.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not found'); }
        else { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, must-revalidate' }); res.end(d2); }
      });
      return;
    }
    const ext = path.extname(f).toLowerCase();
    const noStore = ext === '.html' || ext === '.css' || ext === '.js' || ext === '.json';
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': noStore ? 'no-store, must-revalidate' : 'public, max-age=300' });
    res.end(data);
  });
}).listen(port, () => console.log('PayerPay site serving on :' + port));
