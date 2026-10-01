'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};
const PRIVATE_FILES = new Set([
  'DATABASE_HARDENING.sql',
  'EGYPT_ONLY.sql',
  'OPTIONAL_INTERNATIONAL_SHIPPING.sql',
  'SUPABASE_CHECKOUT.sql',
  'SUPABASE_EVENT_CART.sql',
  'SUPABASE_PRODUCTS_20.sql',
  'INSTALL.txt',
  'LOGO-UPDATE.txt',
  'README.txt',
  'README-MASTER.txt',
  'package.json',
  'package-lock.json',
  'server.js',
]);
const PRIVATE_DIRS = new Set(['tests', '.github']);

function applyHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "img-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "media-src 'self' https:",
    "frame-src 'self'"
  ].join('; ') + ';');
}

const server = http.createServer((req, res) => {
  applyHeaders(res);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }

  if (pathname.includes('\\') || pathname.split('/').some((part) => part.startsWith('.'))) {
    res.writeHead(404).end('Not found');
    return;
  }

  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const firstSegment = relative.split('/')[0];
  if (PRIVATE_DIRS.has(firstSegment)) {
    res.writeHead(404).end('Not found');
    return;
  }
  const filename = path.resolve(ROOT, relative);
  if (!filename.startsWith(`${ROOT}${path.sep}`) || PRIVATE_FILES.has(path.basename(filename))) {
    res.writeHead(404).end('Not found');
    return;
  }

  const type = TYPES[path.extname(filename).toLowerCase()];
  if (!type) {
    res.writeHead(404).end('Not found');
    return;
  }

  fs.stat(filename, (statError, stat) => {
    if (statError || !stat.isFile()) {
      const notFound = path.join(ROOT, '404.html');
      fs.readFile(notFound, (readError, body) => {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(req.method === 'HEAD' || readError ? undefined : body);
      });
      return;
    }
    const ext = path.extname(filename).toLowerCase();
    const cacheControl = ext === '.html'
      ? 'no-cache, max-age=0, must-revalidate'
      : 'public, max-age=300';
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': stat.size,
      'Cache-Control': cacheControl,
      'Last-Modified': stat.mtime.toUTCString(),
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    fs.createReadStream(filename).on('error', () => res.destroy()).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  process.stdout.write(`Static storefront listening on ${PORT}\n`);
});
