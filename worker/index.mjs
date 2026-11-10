import { createAppearanceHandler } from "../api/appearance.mjs";

const fonts =
  /^\/assets\/fonts\/(geist-regular|geist-bold|geist-mono|instrument-serif-regular|instrument-serif-italic)\.woff2$/;

async function appearance(request, env, fetchImpl) {
  const headers = new Headers();
  let body = "";
  const response = {
    statusCode: 200,
    setHeader(name, value) {
      headers.set(name, value);
    },
    end(value) {
      body = value;
    },
  };
  await createAppearanceHandler({ env, fetch: fetchImpl })(request, response);
  return new Response(request.method === "HEAD" ? null : body, {
    status: response.statusCode,
    headers,
  });
}

export function createWorker(fetchImpl = globalThis.fetch) {
  return {
    async fetch(request, env) {
      const url = new URL(request.url);
      let response;
      if (url.hostname === "havesomecode.io") {
        url.protocol = "https:";
        url.hostname = "www.havesomecode.io";
        response = new Response(null, {
          status: 301,
          headers: { Location: url.toString() },
        });
      } else if (url.pathname === "/api/appearance") {
        response = await appearance(request, env, fetchImpl);
      } else if (url.pathname === "/about") {
        response = new Response(null, {
          status: 308,
          headers: { Location: "/#about" },
        });
      } else {
        response = await env.ASSETS.fetch(request);
        if (response.status === 307 && url.pathname.endsWith(".html")) {
          response = new Response(null, {
            status: 308,
            headers: response.headers,
          });
        }
      }
      response = new Response(response.body, response);
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload",
      );
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-Frame-Options", "DENY");
      response.headers.set("Referrer-Policy", "same-origin");
      response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()",
      );
      if (fonts.test(url.pathname))
        response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    },
  };
}

export default createWorker();
