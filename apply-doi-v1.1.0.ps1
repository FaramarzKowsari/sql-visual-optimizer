param(
  [string]$RepoPath = ""
)

$ErrorActionPreference = "Stop"
$OldDoi = "10.5281/zenodo.21501361"
$NewDoi = "10.5281/zenodo.21522569"
$OldUrl = "https://doi.org/$OldDoi"
$NewUrl = "https://doi.org/$NewDoi"

function Write-Step([string]$Text) {
  Write-Host ""
  Write-Host "==> $Text" -ForegroundColor Cyan
}

function Read-Utf8([string]$Path) {
  return [System.IO.File]::ReadAllText($Path)
}

function Write-Utf8([string]$Path, [string]$Content) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Replace-InFile([string]$RelativePath, [hashtable]$Replacements) {
  $full = Join-Path $RepoPath $RelativePath
  if (-not (Test-Path $full)) {
    Write-Warning "Missing file: $RelativePath"
    return
  }
  $text = Read-Utf8 $full
  foreach ($key in $Replacements.Keys) {
    $text = $text.Replace($key, $Replacements[$key])
  }
  Write-Utf8 $full $text
  Write-Host "Updated: $RelativePath" -ForegroundColor Green
}

if ([string]::IsNullOrWhiteSpace($RepoPath)) {
  $defaultPath = Join-Path $env:USERPROFILE "Documents\GitHub\sql-visual-optimizer"
  if (Test-Path $defaultPath) {
    $RepoPath = $defaultPath
  } else {
    $RepoPath = Read-Host "Enter the full path to the local sql-visual-optimizer repository"
  }
}

$RepoPath = [System.IO.Path]::GetFullPath($RepoPath)
if (-not (Test-Path (Join-Path $RepoPath "package.json"))) {
  throw "The selected folder is not the sql-visual-optimizer repository: $RepoPath"
}

Write-Host "Repository: $RepoPath" -ForegroundColor Yellow
Write-Host "Latest DOI: $NewDoi" -ForegroundColor Yellow

# Create a backup of every text file that may be changed.
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $env:TEMP "sql-visual-optimizer-doi-backup-$timestamp"
$targets = @(
  "README.md",
  ".zenodo.json",
  "CITATION.cff",
  "index.html",
  "src\App.tsx",
  "src\components\About.tsx",
  "public\guidebook\index.html",
  "public\images\doi-badge.svg",
  "public\llms.txt",
  "docs\GUIDEBOOK.md",
  "docs\RELEASE_NOTES_v1.1.0.md"
)

Write-Step "Creating safety backup"
foreach ($relative in $targets) {
  $source = Join-Path $RepoPath $relative
  if (Test-Path $source) {
    $destination = Join-Path $backupRoot $relative
    $parent = Split-Path $destination -Parent
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
    Copy-Item $source $destination -Force
  }
}
Write-Host "Backup: $backupRoot" -ForegroundColor Green

Write-Step "Updating application, website, guidebook, and machine-readable links"

# Files where the old DOI represented the current software release.
$simpleFiles = @(
  "src\App.tsx",
  "src\components\About.tsx",
  "public\guidebook\index.html",
  "public\images\doi-badge.svg",
  "public\llms.txt",
  "docs\GUIDEBOOK.md"
)
foreach ($relative in $simpleFiles) {
  Replace-InFile $relative @{ $OldDoi = $NewDoi }
}

# Main HTML metadata: update DOI and software version.
Replace-InFile "index.html" @{
  $OldDoi = $NewDoi
  '"softwareVersion": "1.0.0"' = '"softwareVersion": "1.1.0"'
  '<meta name="citation_publication_date" content="2026-07-22" />' = '<meta name="citation_publication_date" content="2026-07-23" />'
}

Write-Step "Updating README while preserving the v1.0.0 history"
$readmePath = Join-Path $RepoPath "README.md"
$readme = Read-Utf8 $readmePath

$readme = $readme.Replace(
  "[![DOI](public/images/doi-badge.svg)]($OldUrl)",
  "[![DOI](public/images/doi-badge.svg)]($NewUrl)"
)
$readme = $readme.Replace(
  "**Archived release:** ``$OldUrl``",
  "**Latest archived release (v1.1.0):** ``$NewUrl``"
)
$readme = $readme.Replace(
  "- [SQL Visual Optimizer v1.0.0 archived software release on Zenodo]($OldUrl)",
  "- [SQL Visual Optimizer v1.1.0 archived software release on Zenodo]($NewUrl)`r`n- [Previous SQL Visual Optimizer v1.0.0 archived release]($OldUrl)"
)
$readme = $readme.Replace(
  "- Software DOI: $OldUrl",
  "- Latest Software DOI: $NewUrl"
)
$readme = $readme.Replace(
  "Please cite the archived ``v1.0.0`` software release as:",
  "Please cite the archived ``v1.1.0`` software release as:"
)
$readme = $readme.Replace(
  "(Version 1.0.0) [Computer software]. Zenodo. $OldUrl",
  "(Version 1.1.0) [Computer software]. Zenodo. $NewUrl"
)
if (-not $readme.Contains("Previous archived release: ``v1.0.0``")) {
  $readme = $readme.Replace(
    "Machine-readable citation metadata is available in [``CITATION.cff``](CITATION.cff).",
    "Previous archived release: ``v1.0.0`` — $OldUrl`r`n`r`nMachine-readable citation metadata is available in [``CITATION.cff``](CITATION.cff)."
  )
}
Write-Utf8 $readmePath $readme
Write-Host "Updated: README.md" -ForegroundColor Green

Write-Step "Updating CITATION.cff"
$citationPath = Join-Path $RepoPath "CITATION.cff"
$citation = Read-Utf8 $citationPath

if (-not $citation.Contains("value: `"$NewDoi`"")) {
  $citation = $citation.Replace(
    '    orcid: "https://orcid.org/0000-0003-1692-0453"' + "`r`n" + 'repository-code:',
    '    orcid: "https://orcid.org/0000-0003-1692-0453"' + "`r`n" +
    "identifiers:`r`n" +
    "  - type: doi`r`n" +
    "    value: `"$NewDoi`"`r`n" +
    "repository-code:"
  )
  # LF fallback
  $citation = $citation.Replace(
    '    orcid: "https://orcid.org/0000-0003-1692-0453"' + "`n" + 'repository-code:',
    '    orcid: "https://orcid.org/0000-0003-1692-0453"' + "`n" +
    "identifiers:`n" +
    "  - type: doi`n" +
    "    value: `"$NewDoi`"`n" +
    "repository-code:"
  )
}
if (-not $citation.Contains("  doi: `"$NewDoi`"")) {
  $citation = $citation.Replace(
    "  date-released: 2026-07-23`r`n  url:",
    "  date-released: 2026-07-23`r`n  doi: `"$NewDoi`"`r`n  url:"
  )
  $citation = $citation.Replace(
    "  date-released: 2026-07-23`n  url:",
    "  date-released: 2026-07-23`n  doi: `"$NewDoi`"`n  url:"
  )
}
$citation = $citation.Replace(
  '  url: "https://github.com/FaramarzKowsari/sql-visual-optimizer/releases/tag/v1.1.0"',
  "  url: `"$NewUrl`""
)
Write-Utf8 $citationPath $citation
Write-Host "Updated: CITATION.cff" -ForegroundColor Green

Write-Step "Updating Zenodo metadata"
$zenodoPath = Join-Path $RepoPath ".zenodo.json"
$zenodo = Get-Content -Raw -Path $zenodoPath | ConvertFrom-Json
$zenodo.version = "1.1.0"

$newIdentifier = [PSCustomObject]@{
  identifier = $NewUrl
  relation = "isIdenticalTo"
  resource_type = "software"
}
$existing = @($zenodo.related_identifiers | Where-Object { $_.identifier -eq $NewUrl })
if ($existing.Count -eq 0) {
  $zenodo.related_identifiers = @($zenodo.related_identifiers) + $newIdentifier
}
$zenodo.notes = "Version 1.1.0 adds the official Inside SQL Visual Optimizer ten-page infographic guidebook, a dedicated guidebook landing page, an embedded PDF reader, expanded documentation, and improved search/discovery metadata. Archived version DOI: $NewDoi. Previous v1.0.0 DOI: $OldDoi. The live application is deployed on GitHub Pages and the source code is licensed under MIT."
$zenodoJson = $zenodo | ConvertTo-Json -Depth 20
Write-Utf8 $zenodoPath ($zenodoJson + "`n")
Write-Host "Updated: .zenodo.json" -ForegroundColor Green

Write-Step "Finalizing v1.1.0 release notes"
$releasePath = Join-Path $RepoPath "docs\RELEASE_NOTES_v1.1.0.md"
if (Test-Path $releasePath) {
  $release = Read-Utf8 $releasePath
  $release = $release.Replace(
    "The new v1.1.0 Zenodo DOI will be added to the repository after Zenodo finishes processing this GitHub release.",
    "- Archived v1.1.0 release DOI: $NewUrl"
  )
  if (-not $release.Contains("Archived v1.1.0 release DOI")) {
    $release += "`r`n- Archived v1.1.0 release DOI: $NewUrl`r`n"
  }
  Write-Utf8 $releasePath $release
  Write-Host "Updated: docs\RELEASE_NOTES_v1.1.0.md" -ForegroundColor Green
}

Write-Step "Verifying that the latest DOI appears in the expected files"
$verificationFiles = @(
  "README.md",
  ".zenodo.json",
  "CITATION.cff",
  "index.html",
  "src\App.tsx",
  "src\components\About.tsx",
  "public\guidebook\index.html",
  "public\images\doi-badge.svg",
  "public\llms.txt",
  "docs\GUIDEBOOK.md",
  "docs\RELEASE_NOTES_v1.1.0.md"
)
$failed = @()
foreach ($relative in $verificationFiles) {
  $full = Join-Path $RepoPath $relative
  if ((Test-Path $full) -and ((Read-Utf8 $full).Contains($NewDoi))) {
    Write-Host "OK: $relative" -ForegroundColor Green
  } else {
    Write-Warning "DOI not found after update: $relative"
    $failed += $relative
  }
}

Write-Step "Running tests and production build"
$npm = Get-Command npm -ErrorAction SilentlyContinue
if ($null -eq $npm) {
  Write-Warning "npm was not found. The files were updated, but tests/build were not run."
} else {
  Push-Location $RepoPath
  try {
    & npm run test
    if ($LASTEXITCODE -ne 0) { throw "npm run test failed." }
    & npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build failed." }
    Write-Host "Tests and production build passed." -ForegroundColor Green
  } finally {
    Pop-Location
  }
}

if ($failed.Count -gt 0) {
  throw "Some files did not pass DOI verification: $($failed -join ', ')"
}

Write-Host ""
Write-Host "DOI update completed successfully." -ForegroundColor Green
Write-Host "Latest version DOI: $NewDoi" -ForegroundColor Green
Write-Host "Previous v1.0.0 DOI preserved in README and release history: $OldDoi" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next: open GitHub Desktop, review the changes, commit, and Push origin." -ForegroundColor Cyan
