@echo off
setlocal

if "%1" NEQ "restarted" (
    set SCRIPT_DIR=%~dp0

    cd /d "%SCRIPT_DIR%"

    where choco >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Installing Chocolatey...
        powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
        echo Restarting CMD to finalize Chocolatey installation...
        cmd /c start "" "%~f0" restarted
        exit /b
    )

    where node >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Installing Node.js...
        choco install nodejs --force -y
        echo Restarting CMD to finalize Node.js installation...
        cmd /c start "" "%~f0" restarted
        exit /b
    )

    where make >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Installing Make...
        choco install make --force -y
        echo Restarting CMD to finalize Make installation...
        cmd /c start "" "%~f0" restarted
        exit /b
    )

    echo Restarting CMD to finalize all installations...
    cmd /c start "" "%~f0" restarted
    exit /b
)

start http://localhost:3001/

echo Executing server...
make run

pause