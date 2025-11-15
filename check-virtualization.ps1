# Check if virtualization is properly enabled

Write-Host "🔍 Checking virtualization support..." -ForegroundColor Green

# Check CPU virtualization support
$cpu = Get-CimInstance -ClassName Win32_Processor
Write-Host "CPU: $($cpu.Name)" -ForegroundColor Yellow

# Check if virtualization is enabled in firmware
$virtualization = Get-CimInstance -ClassName Win32_Processor | Select-Object -Property VirtualizationFirmwareEnabled
if ($virtualization.VirtualizationFirmwareEnabled) {
    Write-Host "✅ Virtualization is ENABLED in BIOS" -ForegroundColor Green
} else {
    Write-Host "❌ Virtualization is DISABLED in BIOS" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 How to enable virtualization:" -ForegroundColor Yellow
    Write-Host "1. Restart your computer" -ForegroundColor White
    Write-Host "2. Press F2, F12, or Delete to enter BIOS" -ForegroundColor White
    Write-Host "3. Look for:" -ForegroundColor White
    Write-Host "   - Intel: 'Intel VT-x' or 'Virtualization Technology'" -ForegroundColor Cyan
    Write-Host "   - AMD: 'AMD-V' or 'SVM Mode'" -ForegroundColor Cyan
    Write-Host "4. Set to 'Enabled'" -ForegroundColor White
    Write-Host "5. Save and exit BIOS" -ForegroundColor White
    exit 1
}

# Check Hyper-V status
$hyperv = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All
if ($hyperv.State -eq "Enabled") {
    Write-Host "✅ Hyper-V is enabled" -ForegroundColor Green
} else {
    Write-Host "⚠️ Hyper-V is not enabled" -ForegroundColor Yellow
}

# Check WSL features
$wsl = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
$vmp = Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform

Write-Host "WSL Feature: $($wsl.State)" -ForegroundColor $(if($wsl.State -eq "Enabled"){"Green"}else{"Red"})
Write-Host "Virtual Machine Platform: $($vmp.State)" -ForegroundColor $(if($vmp.State -eq "Enabled"){"Green"}else{"Red"})

Write-Host ""
if ($virtualization.VirtualizationFirmwareEnabled -and $wsl.State -eq "Enabled" -and $vmp.State -eq "Enabled") {
    Write-Host "✅ System is ready for WSL2!" -ForegroundColor Green
} else {
    Write-Host "❌ System needs configuration. Run fix-wsl.ps1" -ForegroundColor Red
}
