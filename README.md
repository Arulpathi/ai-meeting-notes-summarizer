
# AI Meeting Notes Summarizer & Sharer

A super-basic full‑stack app: upload/paste a transcript, add a custom instruction, generate an AI summary (Markdown), edit it, and email it to recipients.

**Stack:** Node.js + Express (serves static HTML). Calls **Groq**'s OpenAI‑compatible Chat Completions API for summaries. Uses **Nodemailer** for email via your SMTP.

## Local Run

1. **Install Node 18+**.
2. Create `.env` from the sample and fill in secrets:
   ```bash
   cp .env.sample .env
   # edit .env to set GROQ_API_KEY and SMTP_* values
   ```
3. Install and run:
   ```bash
   npm install
   npm run dev
   # open http://localhost:3000
   ```

## Docker

```bash
docker build -t meeting-summarizer .
docker run --env-file .env -p 3000:3000 meeting-summarizer
```

## Deploy (Render)

1. Create a new Web Service from this repo/zip.
2. Set **Build Command**: `npm install` and **Start Command**: `npm start`.
3. Add environment variables shown in `render.yaml` (or import the file).
4. Deploy. The app serves `public/index.html` and the `/api/*` endpoints.

## API

- `POST /api/summarize` — body: `{ text, prompt }` → `{ summary }`
- `POST /api/send` — body: `{ to, subject?, summary }` → `{ ok, messageId }`

## Notes

- The frontend is intentionally minimal (no framework).
- If you want Gmail SMTP, create an **App Password**, set:
  - `SMTP_HOST=smtp.gmail.com`
  - `SMTP_PORT=465`
  - `SMTP_SECURE=true`
  - `SMTP_USER=your@gmail.com`
  - `SMTP_PASS=the_app_password`
  - `SMTP_FROM=your@gmail.com`
