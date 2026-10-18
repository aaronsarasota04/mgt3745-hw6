// Worker proxy: the browser never sees the API key.
export default {
  async fetch(request, env) {
    const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return Response.json({ error: "POST only" }, { status: 405, headers: cors });

    let body;
    try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400, headers: cors }); }
    const text = typeof body.text === "string" ? body.text.slice(0, 2000) : "";
    if (!text) return Response.json({ error: "Missing text" }, { status: 400, headers: cors });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts: [{ text: `<your instruction for the feature>\n\n${text}` }] }] }),
    });
    if (!res.ok) return Response.json({ error: `Model request failed (${res.status})` }, { status: 502, headers: cors });

    const data = await res.json();
    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return Response.json({ output }, { headers: cors });
  },
};
