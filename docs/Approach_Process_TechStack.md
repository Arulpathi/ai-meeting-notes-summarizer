
# Approach, Process, and Tech Stack

## Problem Understanding
We need a working full‑stack app where users can:
1) upload or paste a transcript,
2) optionally give a custom instruction,
3) generate an AI summary,
4) edit the summary,
5) email it to recipients.

The UI can be "extremely basic"; the focus is functionality.

## Design Choices
- **Single minimal server** (Node.js + Express) serving both static frontend and API: smallest surface area and simplest deploy.
- **Groq** for summarization: low latency, cost‑effective, OpenAI‑compatible API surface. Easy to swap with any provider if needed.
- **Nodemailer + SMTP** for email: universally compatible; works with Gmail, SES, Mailgun, SendGrid, etc.
- **No database**: the spec doesn't require persistence. Users edit the generated text locally and send via email.

## Prompting Strategy
- If the user supplies a custom instruction, it’s passed through as‑is.
- Else, we default to a compact structure: Executive bullets, Action Items (with owners/dates if available), Key Decisions, Risks/Questions, Next Steps.
- The system prompt enforces: concise, bullet‑first, no hallucinated owners/dates, clean Markdown.

## Security & Config
- All secrets live in `.env` (never committed):
  - `GROQ_API_KEY`
  - `SMTP_*` credentials
- The server validates inputs and returns helpful errors (no text, missing SMTP config, Groq failures).

## Deployment
- **Render**-friendly via `render.yaml`, but works on any Node host.
- **Dockerfile** included for portability.

## Tradeoffs
- No auth since it wasn’t required — simpler demo and faster review.
- No rich editor: plain `<textarea>` keeps things robust and minimal.
- No persistence: reduces complexity; could add SQLite or a KV later if needed (for shareable links, audit logs, etc.).

## Future Enhancements (Optional)
- Add a WYSIWYG Markdown editor.
- Add authentication and per‑user history.
- Add templates for common summary styles (exec brief, sales call, sprint retro).
- Support file formats (.docx, .pdf) with server‑side extraction.
- Add rate limiting and basic spam checks for email.
