# ICC God Mode — Indicator Hub

A live indicator library for custom Pine Script v6 indicators built with the ICC trading framework.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MrwallyST/icc-indicator-hub)

### Environment Variables (set in Vercel dashboard)

| Variable | Description |
|---|---|
| `API_KEY` | Your secret key — any agent/Codex uses this to add indicators |
| `GITHUB_TOKEN` | GitHub PAT with `repo` scope (for API writes) |
| `GITHUB_OWNER` | Your GitHub username (default: MrwallyST) |
| `GITHUB_REPO` | This repo name (default: icc-indicator-hub) |

### API Usage

```bash
# Add a new indicator
curl -X POST https://your-site.vercel.app/api/indicators \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Indicator",
    "badge": "INDICATOR",
    "badgeColor": "#26a69a",
    "description": "What it does",
    "features": [{"icon": "⚡", "label": "Feature", "desc": "Description"}],
    "code": "//@version=6\n..."
  }'

# Get all indicators
curl https://your-site.vercel.app/api/indicators
```

### For AI Agents (Claude, Codex, etc.)

Tell your agent:
> "After building the Pine indicator, POST it to https://your-site.vercel.app/api/indicators using x-api-key: YOUR_KEY"

The agent will automatically add it to this hub.