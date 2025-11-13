# WSL2 + Ubuntu Installation Script for DMX Controller Development
# Run as Administrator

Write-Host "🚀 Installing WSL2 + Ubuntu for ultimate development experience..." -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script must be run as Administrator. Right-click and 'Run as Administrator'"
    exit 1
}

Write-Host "Step 1: Enabling WSL and Virtual Machine Platform..." -ForegroundColor Yellow

# Enable WSL and Virtual Machine Platform
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

Write-Host "Step 2: Installing WSL2..." -ForegroundColor Yellow

# Install WSL2
wsl --install --no-launch

# Set WSL2 as default
wsl --set-default-version 2

Write-Host "Step 3: Installing Ubuntu 22.04..." -ForegroundColor Yellow

# Install Ubuntu
wsl --install -d Ubuntu-22.04 --no-launch

Write-Host "Step 4: Setting up development environment..." -ForegroundColor Yellow

# Copy WSL config
Copy-Item ".wslconfig" "$env:USERPROFILE\.wslconfig" -Force

Write-Host "✅ WSL2 installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 RESTART YOUR COMPUTER NOW" -ForegroundColor Red
Write-Host ""
Write-Host "After restart, run:" -ForegroundColor Cyan
Write-Host "  wsl -d Ubuntu-22.04" -ForegroundColor White
Write-Host "  Then run: ./setup-ubuntu.sh" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
