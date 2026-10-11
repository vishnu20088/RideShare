<#
.SYNOPSIS
  Packages the RideHub project into a clean, lightweight ZIP file for WhatsApp sharing.
  Excludes bloated directories (node_modules, target/classes, .git) while preserving
  all source code, migrations, configs, and documentation.
#>

$sourceDir = $PSScriptRoot
$zipName = "RideHub-WhatsApp-Package.zip"
$zipPath = Join-Path $sourceDir $zipName

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "Removed previous $zipName" -ForegroundColor Yellow
}

Write-Host "Compressing RideHub source code for WhatsApp..." -ForegroundColor Cyan

# Files and folders to include
$excludeList = @("node_modules", ".git", "target", "dist", ".DS_Store", "RideHub-WhatsApp-Package.zip")

$tempStaging = Join-Path $env:TEMP "RideHub-Staging-$([Guid]::NewGuid().ToString().Substring(0,8))"
New-Item -ItemType Directory -Path $tempStaging -Force | Out-Null

try {
    # Copy backend (excluding target)
    $backendDest = Join-Path $tempStaging "backend"
    New-Item -ItemType Directory -Path $backendDest -Force | Out-Null
    Get-ChildItem -Path (Join-Path $sourceDir "backend") -Force | Where-Object { $_.Name -ne "target" } | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $backendDest -Recurse -Force
    }

    # Copy frontend (excluding node_modules and dist)
    $frontendDest = Join-Path $tempStaging "frontend"
    New-Item -ItemType Directory -Path $frontendDest -Force | Out-Null
    Get-ChildItem -Path (Join-Path $sourceDir "frontend") -Exclude "node_modules", "dist" | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $frontendDest -Recurse -Force
    }

    # Copy root files
    Get-ChildItem -Path $sourceDir -File | Where-Object { $_.Name -ne $zipName } | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $tempStaging -Force
    }

    # Create Zip
    Compress-Archive -Path "$tempStaging\*" -DestinationPath $zipPath -CompressionLevel Optimal

    $fileSizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
    $fileSizeKB = [math]::Round((Get-Item $zipPath).Length / 1KB, 2)

    Write-Host "`nSUCCESS! Clean WhatsApp package created:" -ForegroundColor Green
    Write-Host "Location: $zipPath" -ForegroundColor White
    if ($fileSizeMB -ge 1) {
        Write-Host "File Size: $fileSizeMB MB (Easily fits WhatsApp 100MB limit!)" -ForegroundColor Green
    } else {
        Write-Host "File Size: $fileSizeKB KB (Ultra-lightweight! Perfect for WhatsApp!)" -ForegroundColor Green
    }
}
finally {
    if (Test-Path $tempStaging) {
        Remove-Item -Path $tempStaging -Recurse -Force -ErrorAction SilentlyContinue
    }
}
