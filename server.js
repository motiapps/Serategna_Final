#!/usr/bin/env node
/**
 * Serategna mobile localhost dev server.
 *
 * Zero-dependency static file server that binds to all interfaces so the
 * app can be opened from this machine, an emulator, or a phone on the
 * same network. Run with: npm start  (or: node server.js [port])
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const qr = require("./qr");

const PORT = Number(process.argv[2] || process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const PUBLIC_DIR = path.join(__dirname, "public");
const MVP_DIR = path.join(__dirname, "mvp");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

function lanAddresses() {
  const addresses = [];
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const info of iface || []) {
      if (info.family === "IPv4" && !info.internal) {
        addresses.push(info.address);
      }
    }
  }
  return addresses;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function qrPage(port) {
  const lan = lanAddresses();
  const url = lan.length
    ? `http://${lan[0]}:${port}`
    : `http://localhost:${port}`;
  let svg;
  try {
    svg = qr.toSvg(qr.encode(url));
  } catch (err) {
    svg = `<p>Could not generate QR code: ${escapeHtml(err.message)}</p>`;
  }
  const note = lan.length
    ? "Scan with a phone on the same Wi-Fi network."
    : "No LAN address found — this QR points at localhost and only works on this machine.";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Serategna · Scan to open</title>
<style>
  body { font-family: system-ui, sans-serif; background: #f4f6f5; color: #1c2422;
         display: flex; flex-direction: column; align-items: center; justify-content: center;
         min-height: 100vh; margin: 0; padding: 1rem; text-align: center; }
  .qr { width: min(75vmin, 420px); background: #fff; border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1); padding: 8px; }
  .qr svg { display: block; width: 100%; height: auto; }
  code { font-size: 1.05rem; background: #fff; border: 1px solid #e0e6e3;
         border-radius: 8px; padding: 0.3rem 0.7rem; }
  p { color: #5c6b66; }
</style>
</head>
<body>
<h1>Serategna</h1>
<div class="qr">${svg}</div>
<p>${note}</p>
<code>${escapeHtml(url)}</code>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  // Simple health endpoint for tooling and connectivity checks.
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "ok", time: new Date().toISOString() }));
    return;
  }

  // QR page: open on this machine and scan it with a phone.
  if ((req.url || "").split("?")[0] === "/qr") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(qrPage(PORT));
    return;
  }

  const requestPath = decodeURIComponent((req.url || "/").split("?")[0]);

  // The MVP app lives under /mvp/ and uses relative asset paths, so make
  // sure the bare /mvp URL gets a trailing slash.
  if (requestPath === "/mvp") {
    res.writeHead(301, { Location: "/mvp/" });
    res.end();
    return;
  }

  let rootDir = PUBLIC_DIR;
  let relPath = requestPath;
  if (requestPath.startsWith("/mvp/")) {
    rootDir = MVP_DIR;
    relPath = requestPath.slice("/mvp".length);
  }

  const safePath = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, "");
  let filePath = path.join(rootDir, safePath);

  // Prevent path traversal outside the served directory.
  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (relPath === "/" || relPath === "") {
    filePath = path.join(rootDir, "index.html");
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        // SPA-style fallback: unknown routes serve the app shell.
        fs.readFile(path.join(rootDir, "index.html"), (fallbackErr, shell) => {
          if (fallbackErr) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("404 Not Found");
            return;
          }
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(shell);
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(data);
    });
  });
});

server.listen(PORT, HOST, () => {
  const lines = [
    "",
    "  Serategna mobile dev server is running",
    "  ──────────────────────────────────────",
    `  Local:            http://localhost:${PORT}`,
    `  Android emulator: http://10.0.2.2:${PORT}`,
    `  iOS simulator:    http://localhost:${PORT}`,
  ];
  const lan = lanAddresses();
  for (const address of lan) {
    lines.push(`  On your network:  http://${address}:${PORT}  (phone on same Wi-Fi)`);
  }
  lines.push(
    "",
    `  USB device (Android): adb reverse tcp:${PORT} tcp:${PORT}  then open http://localhost:${PORT}`,
    `  QR page:              http://localhost:${PORT}/qr`,
    "  Press Ctrl+C to stop.",
    ""
  );
  if (lan.length) {
    const url = `http://${lan[0]}:${PORT}`;
    try {
      lines.push(`  Scan to open ${url} on your phone:`, "", qr.toTerminal(qr.encode(url)), "");
    } catch (err) {
      // QR is a convenience; never block startup on it.
    }
  }
  console.log(lines.join("\n"));
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Try: node server.js ${PORT + 1}`);
    process.exit(1);
  }
  throw err;
});
