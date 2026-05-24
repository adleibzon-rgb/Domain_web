#!/usr/bin/env node
/**
 * Local GeoExport mirror: static assets + cached JSON + proxy for dynamic API.
 */
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4173;
const UPSTREAM = "geoexport.org";

const LOCAL_API = new Set([
  "/api/presets",
  "/api/sources",
  "/api/last-update",
  "/api/routing/presets",
]);

const DATA_MAP = {
  "/api/presets": "presets.json",
  "/api/sources": "sources.json",
  "/api/last-update": "last-update.json",
  "/api/routing/presets": "routing-presets.json",
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  const type = MIME[ext] || "application/octet-stream";
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, "Not found");
      return;
    }
    send(res, 200, data, { "Content-Type": type });
  });
}

function serveLocalApi(res, pathname) {
  const file = DATA_MAP[pathname];
  if (!file) {
    send(res, 404, JSON.stringify({ error: "unknown local api" }), {
      "Content-Type": "application/json",
    });
    return;
  }
  const full = path.join(__dirname, "data", file);
  fs.readFile(full, (err, data) => {
    if (err) {
      send(res, 500, JSON.stringify({ error: err.message }), {
        "Content-Type": "application/json",
      });
      return;
    }
    send(res, 200, data, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-cache",
    });
  });
}

function proxyToUpstream(req, res) {
  const options = {
    hostname: UPSTREAM,
    port: 443,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: UPSTREAM,
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    const headers = { ...proxyRes.headers };
    delete headers["content-security-policy"];
    res.writeHead(proxyRes.statusCode || 502, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    send(res, 502, JSON.stringify({ error: `Upstream error: ${err.message}` }), {
      "Content-Type": "application/json",
    });
  });

  req.pipe(proxyReq);
}

function handler(req, res) {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname.startsWith("/api/")) {
    if (LOCAL_API.has(pathname)) {
      serveLocalApi(res, pathname);
      return;
    }
    proxyToUpstream(req, res);
    return;
  }

  if (pathname === "/") pathname = "/index.html";

  const safe = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(__dirname, safe);

  if (!filePath.startsWith(__dirname)) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      if (!path.extname(pathname)) {
        serveFile(res, path.join(__dirname, "index.html"));
        return;
      }
      send(res, 404, "Not found");
      return;
    }
    serveFile(res, filePath);
  });
}

http.createServer(handler).listen(PORT, () => {
  console.log(`GeoExport clone: http://127.0.0.1:${PORT}`);
  console.log(`Static + local JSON; export/search/lookup proxied to ${UPSTREAM}`);
});
