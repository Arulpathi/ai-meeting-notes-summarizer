import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Summarize endpoint
// Summarize endpoint
app.post("/api/summarize", async (req, res) => {
  try {
    const { text, prompt } = req.body || {};
    if (!text?.trim()) return res.status(400).json({ error: "No transcript text provided." });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Server missing GROQ_API_KEY." });

    const model = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";

    const instruction = prompt?.trim() || "Summarize succinctly. Include: Executive bullets, Action Items, Key Decisions, Risks/Questions, Next Steps.";

    const system = `You are an assistant that turns raw meeting/call transcripts into clean, structured summaries.
- Respect the user's custom instruction if provided.
- Keep it concise and accurate.
- Prefer bullet points.
- If specific data (owner/due date) is missing, don't invent it.
- Output clean, readable Markdown.`;

    const userContent = `Custom instruction (if any): ${instruction}\n\nTranscript:\n"""\n${text}\n"""`;

    const body = { model, messages: [{ role: "system", content: system }, { role: "user", content: userContent }], temperature: 0.2, stream: false };

    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    if (!resp.ok) return res.status(resp.status).json({ error: "Groq API error", details: data });

    const content = data?.choices?.[0]?.message?.content || "";
    res.json({ summary: content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Unexpected server error.", details: String(e) });
  }
});


// Email sending
app.post("/api/send", async (req, res) => {
  try {
    const { to, subject, summary } = req.body || {};
    if (!to || !summary) return res.status(400).json({ error: "Missing 'to' or 'summary'." });

    const recipients = Array.isArray(to)
      ? to
      : String(to).split(",").map(s => s.trim()).filter(Boolean);

    if (recipients.length === 0) return res.status(400).json({ error: "No recipient emails provided." });

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_FROM) {
      return res.status(500).json({ error: "Server missing SMTP configuration (SMTP_HOST, SMTP_PORT, SMTP_FROM)." });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE || "").toLowerCase() === "true",
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
    });

    const mailOptions = {
      from: SMTP_FROM,
      to: recipients.join(","),
      subject: subject || "Meeting Summary",
      text: summary,
      html: `<pre style="font-family: monospace; white-space: pre-wrap;">${summary.replace(/</g, "&lt;")}</pre>`
    };

    const result = await transporter.sendMail(mailOptions);
    res.json({ ok: true, messageId: result.messageId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to send email.", details: String(e) });
  }
});

// Fallback to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
