param(
  [string]$Repo = "MrwallyST/icc-indicator-hub",
  [string]$LiveUrl = "https://icc-indicator-hub.vercel.app",
  [string]$ApiKey = "wXbPhMgqaZQVpwJqo8DcMaCvTuuXw6hxEwXJsCR8BNQ"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Require-Command($Name, $Hint) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name was not found. $Hint"
  }
}

function Run($Command) {
  Write-Host ""
  Write-Host "> $Command" -ForegroundColor Cyan
  Invoke-Expression $Command
}

function Set-VercelEnv($Name, $Value) {
  $envList = npx vercel env ls production 2>$null
  if ($envList -match "(?m)^\s*$Name\s") {
    Run "npx vercel env rm $Name production --yes"
  }

  $Value | npx vercel env add $Name production
}

Require-Command "git" "Install Git for Windows first."
Require-Command "gh" "Install GitHub CLI first, then run: gh auth login"
Require-Command "node" "Install Node.js first."
Require-Command "npm" "Install Node.js/npm first."

Write-Host "Checking GitHub login..." -ForegroundColor Yellow
$ghStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  if (Test-Path Env:GITHUB_TOKEN) { Remove-Item Env:GITHUB_TOKEN -ErrorAction SilentlyContinue }
  if (Test-Path Env:GH_TOKEN) { Remove-Item Env:GH_TOKEN -ErrorAction SilentlyContinue }
  $ghStatus = gh auth status 2>&1
}
if ($LASTEXITCODE -ne 0) {
  Write-Host $ghStatus
  throw "GitHub CLI is not logged in. Run 'gh auth login' first, then rerun this script."
}

Write-Host "Checking local Git state..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
  Run "git init"
  Run "git branch -M main"
}

Run "git add ."
$pending = git status --porcelain
if ($pending) {
  Run "git commit -m `"Prepare GitHub-backed indicator hub`""
} else {
  Write-Host "No local changes to commit."
}

Write-Host "Creating or connecting GitHub repo..." -ForegroundColor Yellow
gh repo view $Repo *> $null
if ($LASTEXITCODE -ne 0) {
  Run "gh repo create $Repo --public --source=. --remote=origin --push"
} else {
  $origin = git remote get-url origin 2>$null
  if ($LASTEXITCODE -ne 0) {
    Run "git remote add origin https://github.com/$Repo.git"
  } elseif ($origin -ne "https://github.com/$Repo.git") {
    Run "git remote set-url origin https://github.com/$Repo.git"
  }
  Run "git push -u origin main"
}

Write-Host ""
Write-Host "Now paste a GitHub Classic token with repo scope." -ForegroundColor Yellow
Write-Host "Create it at: https://github.com/settings/tokens"
$secureToken = Read-Host "GitHub token" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
$githubToken = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

if (-not $githubToken) {
  throw "No GitHub token was entered."
}

Write-Host "Setting Vercel production environment variables..." -ForegroundColor Yellow
Set-VercelEnv "API_KEY" $ApiKey
Set-VercelEnv "GITHUB_OWNER" "MrwallyST"
Set-VercelEnv "GITHUB_REPO" "icc-indicator-hub"
Set-VercelEnv "GITHUB_TOKEN" $githubToken

Write-Host "Redeploying production..." -ForegroundColor Yellow
Run "npx vercel --prod --yes"

Write-Host "Verifying live indicators..." -ForegroundColor Yellow
$data = Invoke-RestMethod "$LiveUrl/api/indicators"
Write-Host "Live URL: $LiveUrl" -ForegroundColor Green
Write-Host "Indicator count: $($data.Count)" -ForegroundColor Green
$data | Select-Object id,title,version | Format-Table -AutoSize
