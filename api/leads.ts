import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z, ZodError } from "zod";

function parseRequestBody(req: VercelRequest) {
  const body = req.body;
  if (body === undefined || body === null) return body;

  if (typeof body === "string") return JSON.parse(body);
  if (Buffer.isBuffer(body)) return JSON.parse(body.toString("utf-8"));

  return body;
}

const leadSchema = z.object({
  tenant: z.string().optional(),
  embed: z.boolean().optional(),
  url: z.string().optional(),
  utm: z.record(z.string()).optional(),
  // Simple honeypot. Keep this field hidden in the UI.
  website: z.string().optional(),
  contact: z.object({
    company: z.string().optional(),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    message: z.string().optional(),
  }),
  calculation: z
    .object({
      timeframeYears: z.number().optional(),
      taxIncentiveRegion: z.string().optional(),
      fleetSize: z.number().optional(),
      bestElectricName: z.string().optional(),
      maxSavings: z.number().optional(),
      breakEvenYear: z.number().nullable().optional(),
      breakEvenMonth: z.number().nullable().optional(),
    })
    .optional(),
  inputs: z.unknown().optional(),
});

function asText(value: unknown) {
  try {
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

async function sendViaResend(params: {
  to: string;
  from: string;
  subject: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      text: params.text,
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Resend error ${resp.status}: ${body}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS (safe default; requests are usually same-origin inside an iframe).
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let parsedBody: unknown;
    try {
      parsedBody = parseRequestBody(req);
    } catch (parseError) {
      console.error("Invalid JSON payload:", parseError);
      return res.status(400).json({ error: "Invalid JSON payload" });
    }

    const lead = leadSchema.parse(parsedBody);

    // Honeypot triggered -> act like success to not tip off bots.
    if (lead.website && lead.website.trim().length > 0) {
      return res.status(204).end();
    }

    const to = process.env.LEAD_TO_EMAIL;
    const from = process.env.LEAD_FROM_EMAIL || "Truckonomics <no-reply@truckonomics.app>";

    const subject = `Truckonomics Lead${lead.tenant ? ` (${lead.tenant})` : ""}: ${lead.contact.email}`;

    const text = [
      "NEW LEAD",
      "",
      `Tenant: ${lead.tenant || "n/a"}`,
      `Embed: ${lead.embed ? "yes" : "no"}`,
      `URL: ${lead.url || "n/a"}`,
      "",
      "CONTACT",
      `Company: ${lead.contact.company || "n/a"}`,
      `Name: ${lead.contact.name}`,
      `Email: ${lead.contact.email}`,
      `Phone: ${lead.contact.phone || "n/a"}`,
      "",
      "MESSAGE",
      lead.contact.message || "n/a",
      "",
      "CALCULATION (summary)",
      asText(lead.calculation || {}),
      "",
      "UTM",
      asText(lead.utm || {}),
      "",
      "INPUTS (raw)",
      asText(lead.inputs || {}),
      "",
      "META",
      `User-Agent: ${req.headers["user-agent"] || "n/a"}`,
      `IP: ${req.headers["x-forwarded-for"] || req.socket.remoteAddress || "n/a"}`,
    ].join("\n");

    if (!to) {
      console.warn("LEAD_TO_EMAIL not set; lead logged only");
      console.log(text);
      return res.status(200).json({ ok: true, delivered: false });
    }

    if (process.env.RESEND_API_KEY) {
      await sendViaResend({ to, from, subject, text });
      return res.status(200).json({ ok: true, delivered: true, provider: "resend" });
    }

    // No email provider configured -> log the lead and return success.
    console.warn("No email provider configured (set RESEND_API_KEY). Lead logged only.");
    console.log(text);
    return res.status(200).json({ ok: true, delivered: false });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    console.error("Lead capture error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

