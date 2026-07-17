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

const PORT = Number(process.argv[2] || process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const PUBLIC_DIR = path.join(__dirname, "public");

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

const server = http.createServer((req, res) => {
  // Simple health endpoint for tooling and connectivity checks.
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "ok", time: new Date().toISOString() }));
    return;
  }

  const requestPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const safePath = path
    .normalize(requestPath)
    .replace(/^(\.\.[\/\\])+/, "");
  let filePath = path.join(PUBLIC_DIR, safePath);

  // Prevent path traversal outside the public directory.
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (requestPath === "/" || requestPath === "") {
    filePath = path.join(PUBLIC_DIR, "index.html");
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        // SPA-style fallback: unknown routes serve the app shell.
        fs.readFile(path.join(PUBLIC_DIR, "index.html"), (fallbackErr, shell) => {
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
  for (const address of lanAddresses()) {
    lines.push(`  On your network:  http://${address}:${PORT}  (phone on same Wi-Fi)`);
  }
  lines.push(
    "",
    `  USB device (Android): adb reverse tcp:${PORT} tcp:${PORT}  then open http://localhost:${PORT}`,
    "  Press Ctrl+C to stop.",
    ""
  );
  console.log(lines.join("\n"));
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Try: node server.js ${PORT + 1}`);
    process.exit(1);
  }
  throw err;
});
