import { createAppearanceHandler } from "../api/appearance.mjs";

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
      } else if (/\/{2,}/.test(url.pathname)) {
        response = new Response(null, {
          status: 308,
          headers: {
            Location: `${url.pathname.replace(/\/{2,}/g, "/")}${url.search}`,
          },
        });
      } else if (
        ["/api/appearance", "/api/appearance/"].includes(url.pathname)
      ) {
        response = await appearance(request, env, fetchImpl);
      } else if (url.pathname === "/about") {
        response = new Response(null, {
          status: 308,
          headers: { Location: `/${url.search}#about` },
        });
      } else if (/^\/index(?:\.html)?\/?$/.test(url.pathname)) {
        response = new Response(null, {
          status: 308,
          headers: { Location: `/${url.search}` },
        });
      } else if (/\.html\/?$/.test(url.pathname)) {
        response = new Response(null, {
          status: 308,
          headers: {
            Location: `${url.pathname.replace(/\.html\/?$/, "")}${url.search}`,
          },
        });
      } else {
        const assetUrl = new URL(request.url);
        if (
          ["/about/", "/404/", "/linkedin-editorial-scout-privacy/"].includes(
            url.pathname,
          ) ||
          /\.[^/]+\/$/.test(url.pathname)
        ) {
          assetUrl.pathname = assetUrl.pathname.slice(0, -1);
        }
        if (request.method === "OPTIONS") {
          response = new Response(null, { status: 204 });
        } else {
          const isRead = ["GET", "HEAD"].includes(request.method);
          const assetRequest = isRead
            ? new Request(assetUrl, request)
            : new Request(assetUrl, {
                method: "GET",
                headers: request.headers,
              });
          response = await env.ASSETS.fetch(assetRequest);
          if (!isRead && response.status === 200) {
            response = new Response(null, { status: 405 });
          } else if (response.status === 200 || response.status === 404) {
            response = new Response(response.body, response);
            response.headers.set("Access-Control-Allow-Origin", "*");
          }
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
      return response;
    },
  };
}

export default createWorker();
