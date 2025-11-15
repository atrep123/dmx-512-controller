# Install Ubuntu after WSL2 is properly configured

Write-Host "🐧 Installing Ubuntu 22.04..." -ForegroundColor Green

# Check if WSL2 is available
$wslVersion = wsl --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Error "WSL2 is not properly installed. Run fix-wsl.ps1 first!"
    exit 1
}

Write-Host "Step 1: Installing Ubuntu 22.04..." -ForegroundColor Yellow

# Install Ubuntu
wsl --install Ubuntu-22.04

Write-Host "Step 2: Waiting for Ubuntu installation..." -ForegroundColor Yellow

# Wait a bit for installation to complete
Start-Sleep -Seconds 10

Write-Host "Step 3: Setting Ubuntu as default..." -ForegroundColor Yellow

# Set Ubuntu as default
wsl --set-default Ubuntu-22.04

Write-Host "Step 4: Creating WSL config..." -ForegroundColor Yellow

# Copy WSL config to user profile
if (Test-Path ".\.wslconfig") {
    Copy-Item ".\.wslconfig" "$env:USERPROFILE\.wslconfig" -Force
    Write-Host "✅ WSL config copied" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Ubuntu installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "1. wsl -d Ubuntu-22.04" -ForegroundColor White
Write-Host "2. Set up username and password" -ForegroundColor White
Write-Host "3. Run: ./setup-ubuntu.sh" -ForegroundColor White
Write-Host ""
