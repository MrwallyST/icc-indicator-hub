# GitHub + Vercel Setup

Your hub is already live on Vercel:

https://icc-indicator-hub.vercel.app

Right now it shows the bundled indicators from `data/indicators.json`. To make future API-added indicators save permanently, connect this folder to GitHub and add a GitHub token to Vercel.

## One-time steps

1. Open PowerShell.
2. Log into GitHub CLI:

```powershell
gh auth login
```

Choose GitHub.com, HTTPS, and browser login.

3. Create a GitHub Classic token:

https://github.com/settings/tokens

Use Classic token, give it `repo` scope, then copy it.

4. Run the helper from this project folder:

```powershell
cd "C:\Users\cesar\Desktop\My_Indicator_Hub\icc_indicator_hub\icc-indicator-hub"
.\connect-github-and-redeploy.ps1
```

Paste the GitHub token when it asks. The script will:

- create or connect `MrwallyST/icc-indicator-hub`
- push this project to GitHub
- add Vercel production env vars
- redeploy Vercel
- verify the live indicator count

## Live URL

https://icc-indicator-hub.vercel.app

## Expected indicators

- ICC God Mode - Master
- ICC God Mode - Crypto
- ICC God Mode - Strategy
