import { NextResponse } from "next/server";
import bundledIndicators from "../../../data/indicators.json";

const OWNER = process.env.GITHUB_OWNER || "MrwallyST";
const REPO  = process.env.GITHUB_REPO  || "icc-indicator-hub";
const FILE  = "data/indicators.json";
const RAW   = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${FILE}`;

// ── GET: fetch indicators live from GitHub raw ──────────────────────────────
export async function GET() {
  try {
    const res = await fetch(`${RAW}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return NextResponse.json(bundledIndicators, { status: 200 });
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) && data.length > 0 ? data : bundledIndicators);
  } catch {
    return NextResponse.json(bundledIndicators, { status: 200 });
  }
}

// ── POST: add new indicator (writes back to GitHub) ─────────────────────────
export async function POST(request) {
  // Auth
  const key = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.API_KEY || key !== process.env.API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });
  }

  const body = await request.json();
  if (!body.title || !body.code) {
    return NextResponse.json({ error: "Missing required fields: title, code" }, { status: 400 });
  }

  // Generate ID + timestamp
  const newIndicator = {
    ...body,
    id: body.id || (body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now()),
    addedAt: new Date().toISOString(),
    version: body.version || "v1.0",
  };

  // Fetch current indicators
  const current = await fetch(`${RAW}?t=${Date.now()}`, { cache: "no-store" });
  const indicators = current.ok ? await current.json() : [];
  const updated = [...indicators, newIndicator];

  // Fetch current file SHA (required by GitHub API for updates)
  const metaRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`,
    { headers: { Authorization: `token ${token}`, "User-Agent": "icc-hub" } }
  );
  const meta = await metaRes.json();
  const sha = meta.sha;

  // Commit updated file
  const commitRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "icc-hub",
      },
      body: JSON.stringify({
        message: `Add indicator: ${newIndicator.title}`,
        content: Buffer.from(JSON.stringify(updated, null, 2)).toString("base64"),
        sha,
      }),
    }
  );

  if (!commitRes.ok) {
    const err = await commitRes.json();
    return NextResponse.json({ error: "GitHub commit failed", detail: err }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: newIndicator.id, total: updated.length });
}
