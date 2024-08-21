import wtf from "npm:wtf_wikipedia@10.3.2";

const port = Number.parseInt(Deno.env.get("PORT") || "8000");
if (Number.isNaN(port)) {
  console.error("Invalid PORT");
  Deno.exit(1);
}

async function handler(
  req: Request,
  _info: Deno.ServeHandlerInfo
): Promise<Response> {
  const { method } = req;
  const { pathname: path } = new URL(req.url);

  if (path === "/health" && method === "GET") {
    return new Response("OK", { status: 200 });
  } else if (path === "/v1/infobox" && method === "POST") {
    console.log("Received conversion request");

    const requestText = await req.text();

    const start = performance.now();

    let parsed: unknown;
    try {
      parsed = wtf(requestText).infobox()?.json();
    } catch (_e) {
      return new Response("Bad Request", { status: 400 });
    }

    const end = performance.now();
    console.log("Converted in " + Math.round(end - start) / 1000 + "s");

    return new Response(JSON.stringify(parsed ?? {}), {
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response("Not Found", { status: 404 });
  }
}

Deno.serve({ handler, port });
