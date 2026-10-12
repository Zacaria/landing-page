// Local-only browser harness. No fixture route enters production output.
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderIndex, renderArticle } from "../scripts/render.mjs";
import { fixture } from "./fixtures.mjs";
const root = path.resolve("dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".ico": "image/x-icon",
};
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  if (url.pathname === "/fixture" || url.pathname === "/fixture/") {
    res.setHeader("Content-Type", types[".html"]);
    return res.end(renderIndex(fixture()));
  }
  if (url.pathname === "/blog/test-renderer") {
    const s = fixture();
    res.setHeader("Content-Type", types[".html"]);
    return res.end(renderArticle(s.articles[0], s));
  }
  if (url.pathname === "/private-fixture-preview") {
    const s = fixture();
    res.setHeader("Content-Type", types[".html"]);
    return res.end(renderArticle(s.articles[0], s, { preview: true }));
  }
  const route = url.pathname === "/" ? "/index.html" : url.pathname;
  if (!/^\/[a-zA-Z0-9_./-]+$/.test(route) || route.includes("..")) {
    res.writeHead(400);
    return res.end();
  }
  try {
    const file = path.join(root, route);
    let data;
    try {
      data = await readFile(file);
    } catch {
      data = await readFile(file + ".html");
    }
    res.setHeader("Content-Type", types[path.extname(file)] || types[".html"]);
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end(await readFile(path.join(root, "404.html")));
  }
});
server.listen(8793, "127.0.0.1", () =>
  console.log("Local browser harness ready"),
);
