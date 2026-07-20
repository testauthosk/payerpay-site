// Минимальный статик-сервер для Railway (без зависимостей).
const http = require('http'), fs = require('fs'), path = require('path');
const port = process.env.PORT || 3000, root = __dirname;
// Уникален на каждый запуск сервера (= каждый деплой) → ломает кэш css/js у браузеров/webview.
const BUILD = Date.now();
const bd = new Date(BUILD);
const p2 = (n) => ('0' + n).slice(-2);
const BUILD_LABEL = p2(bd.getUTCHours()) + ':' + p2(bd.getUTCMinutes()) + ':' + p2(bd.getUTCSeconds()) + ' UTC';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff2': 'font/woff2' };

// Проставляет ?v=BUILD в ссылки на локальные css/js, чтобы старый кэш не подменял свежий файл.
const versionAssets = (html) => html.replace(/(\b(?:href|src)=")(styles\.css|app\.js|faq\.js)(")/g, `$1$2?v=${BUILD}$3`);
// Видимый штамп сборки (только при ?debug) — чтобы сразу видеть, свежая ли страница.
const BADGE = `<div style="position:fixed;bottom:8px;right:10px;z-index:99999;font:700 11px system-ui,-apple-system,sans-serif;color:#fff;background:#C0552E;padding:4px 9px;border-radius:8px;box-shadow:0 3px 12px rgba(0,0,0,.25);pointer-events:none">build ${BUILD_LABEL}</div>`;

const sendHtml = (res, buf, url) => {
  let body = versionAssets(buf.toString('utf8'));
  if (/[?&]debug/.test(url || '')) body = body.replace('</body>', BADGE + '</body>');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, must-revalidate' });
  res.end(body);
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/' || p.endsWith('/')) p += 'index.html';
  const f = path.normalize(path.join(root, p));
  if (!f.startsWith(root)) { res.writeHead(403); return res.end('403'); }
  fs.readFile(f, (e, data) => {
    if (e) { // фолбэк на index.html
      fs.readFile(path.join(root, 'index.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not found'); }
        else sendHtml(res, d2, req.url);
      });
      return;
    }
    const ext = path.extname(f).toLowerCase();
    if (ext === '.html') return sendHtml(res, data, req.url);
    const noStore = ext === '.css' || ext === '.js' || ext === '.json';
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': noStore ? 'no-store, must-revalidate' : 'public, max-age=300' });
    res.end(data);
  });
}).listen(port, () => console.log('PayerPay site serving on :' + port + ' build ' + BUILD_LABEL));
