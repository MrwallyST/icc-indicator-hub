import { NextResponse } from "next/server";
import bundledIndicators from "../../../data/indicators.json";

const OWNER = process.env.GITHUB_OWNER || "MrwallyST";
const REPO = process.env.GITHUB_REPO || "icc-indicator-hub";
const FILE = "data/indicators.json";
const BRANCH = "main";
const RAW = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FILE}`;
const CONTENTS = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "icc-hub",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function readGitHubIndicators(token) {
  if (!token) return null;

  const res = await fetch(`${CONTENTS}?ref=${BRANCH}&t=${Date.now()}`, {
    headers: githubHeaders(token),
    cache: "no-store",
  });

  if (res.status === 404) {
    return { indicators: bundledIndicators, sha: null };
  }

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.message || "GitHub read failed");
  }

  const meta = await res.json();
  const decoded = Buffer.from(meta.content || "", "base64").toString("utf8");
  const indicators = JSON.parse(decoded || "[]");

  return {
    indicators: Array.isArray(indicators) && indicators.length > 0 ? indicators : bundledIndicators,
    sha: meta.sha,
  };
}

async function readPublicIndicators() {
  const res = await fetch(`${RAW}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) return bundledIndicators;

  const data = await res.json();
  return Array.isArray(data) && data.length > 0 ? data : bundledIndicators;
}

export async function GET() {
  try {
    const githubData = await readGitHubIndicators(process.env.GITHUB_TOKEN);
    const indicators = githubData?.indicators || await readPublicIndicators();
    return NextResponse.json(indicators);
  } catch {
    return NextResponse.json(bundledIndicators, { status: 200 });
  }
}

export async function POST(request) {
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

  const newIndicator = {
    ...body,
    id: body.id || (body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now()),
    addedAt: new Date().toISOString(),
    version: body.version || "v1.0",
  };

  const currentFile = await readGitHubIndicators(token);
  const indicators = currentFile?.indicators || bundledIndicators;
  const updated = [...indicators, newIndicator];

  const commitBody = {
    message: `Add indicator: ${newIndicator.title}`,
    content: Buffer.from(JSON.stringify(updated, null, 2)).toString("base64"),
    branch: BRANCH,
  };
  if (currentFile?.sha) commitBody.sha = currentFile.sha;

  const commitRes = await fetch(CONTENTS, {
    method: "PUT",
    headers: {
      ...githubHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commitBody),
  });

  if (!commitRes.ok) {
    const detail = await commitRes.json().catch(() => ({}));
    return NextResponse.json({ error: "GitHub commit failed", detail }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: newIndicator.id, total: updated.length });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (request.headers.get('x-api-key') !== 'icc-mafia-2024')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })
  const RAW = 'https://raw.githubusercontent.com/MrwallyST/icc-indicator-hub/main/data/indicators.json'
  const data = await fetch(RAW).then(r => r.json())
  const filtered = data.filter(x => x.id !== id)
  if (filtered.length === data.length)
    return Response.json({ error: 'Not found' }, { status: 404 })
  const fileRes = await fetch('https://api.github.com/repos/MrwallyST/icc-indicator-hub/contents/data/indicators.json', { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } })
  const { sha } = await fileRes.json()
  await fetch('https://api.github.com/repos/MrwallyST/icc-indicator-hub/contents/data/indicators.json', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `Delete indicator ${id}`, content: btoa(JSON.stringify(filtered, null, 2)), sha })
  })
  return Response.json({ success: true, remaining: filtered.length })
}

export async function PUT(request) {
  if (request.headers.get('x-api-key') !== 'icc-mafia-2024')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!body.id) return Response.json({ error: 'Missing id' }, { status: 400 })
  const RAW = 'https://raw.githubusercontent.com/MrwallyST/icc-indicator-hub/main/data/indicators.json'
  const data = await fetch(RAW).then(r => r.json())
  const idx = data.findIndex(x => x.id === body.id)
  if (idx === -1) return Response.json({ error: 'Not found' }, { status: 404 })
  data[idx] = body
  const fileRes = await fetch('https://api.github.com/repos/MrwallyST/icc-indicator-hub/contents/data/indicators.json', { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } })
  const { sha } = await fileRes.json()
  await fetch('https://api.github.com/repos/MrwallyST/icc-indicator-hub/contents/data/indicators.json', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `Update indicator ${body.id}`, content: btoa(JSON.stringify(data, null, 2)), sha })
  })
  return Response.json({ success: true })
}
