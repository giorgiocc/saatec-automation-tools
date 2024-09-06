@echo off
setlocal

set "DesktopPath=%USERPROFILE%\Desktop"

if "%1" NEQ "restarted" (
    where choco >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Installing Chocolatey...
        powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
        echo Restarting CMD to finalize Chocolatey installation...
        cmd /c start "" "%~f0" restarted
    )

    where choco >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install Chocolatey. Exiting...
    )

    where git >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Installing Git...
        choco install git --force -y
        echo Restarting CMD to finalize Git installation...
        cmd /c start "" "%~f0" restarted
    )

    where git >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install Git. Exiting...
    )
)


if not exist "%DesktopPath%\saatec-automation-tools" (
    echo Cloning the saatec-automation-tools repository to the Desktop...
    git clone https://github.com/giorgiocc/saatec-automation-tools.git "%DesktopPath%\saatec-automation-tools"
) else (
    echo Repository already cloned on the Desktop. Skipping cloning.
)

cd /d "%DesktopPath%\saatec-automation-tools"

if not exist "start-server.bat" (
    echo start-server.bat not found in the saatec-automation-tools directory. Exiting...
)

powershell -Command "Start-Process '%cd%\start-server.bat'"
