# proxy/ (Conditional)

Use this folder only if your chosen feature includes AI behavior, such as summarizing, classifying, or drafting text. Otherwise leave it as is; it carries no points either way.

The pattern is the one Module 7 demonstrates: the browser calls your Worker, the Worker calls the Gemini API, and the key lives only in a Worker secret.

```bash
cd proxy
npx wrangler login --device
npx wrangler secret put GEMINI_API_KEY
npx wrangler deploy
```

Put the deployed URL in the main README. Add a TOOLS.md row for the Gemini API in `context/` and a DDR for the crossing.
