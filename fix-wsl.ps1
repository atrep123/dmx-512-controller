# Fix WSL2 Installation Issues - Run as Administrator

Write-Host "🔧 Fixing WSL2 Installation Issues..." -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script must be run as Administrator!"
    exit 1
}

Write-Host "Step 1: Checking system requirements..." -ForegroundColor Yellow

# Check if virtualization is enabled
$virtualization = Get-CimInstance -ClassName Win32_Processor | Select-Object -Property VirtualizationFirmwareEnabled
if ($virtualization.VirtualizationFirmwareEnabled -eq $false) {
    Write-Host "⚠️ Virtualization is disabled in BIOS!" -ForegroundColor Red
    Write-Host "Please enable virtualization in BIOS settings:" -ForegroundColor Yellow
    Write-Host "1. Restart computer and enter BIOS (F2, F12, Delete)" -ForegroundColor White
    Write-Host "2. Look for 'Virtualization Technology' or 'Intel VT-x' or 'AMD-V'" -ForegroundColor White
    Write-Host "3. Enable it and save settings" -ForegroundColor White
    Write-Host "4. Restart and run this script again" -ForegroundColor White
    Read-Host "Press Enter after enabling virtualization in BIOS"
}

Write-Host "Step 2: Enabling all required Windows features..." -ForegroundColor Yellow

# Enable all necessary features
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -All -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -All -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All -NoRestart

Write-Host "Step 3: Using DISM to force enable features..." -ForegroundColor Yellow

# Force enable with DISM
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
dism.exe /online /enable-feature /featurename:Microsoft-Hyper-V /all /norestart

Write-Host "Step 4: Installing WSL2 without distribution first..." -ForegroundColor Yellow

# Install WSL2 without distribution
wsl.exe --install --no-distribution

Write-Host "Step 5: Setting WSL2 as default..." -ForegroundColor Yellow

# Set WSL2 as default version
wsl --set-default-version 2

Write-Host "✅ Phase 1 complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 RESTART YOUR COMPUTER NOW" -ForegroundColor Red -BackgroundColor Yellow
Write-Host ""
Write-Host "After restart, run: .\install-ubuntu.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
