@echo off
title Khoi dong Muxintang Wellness Center
cd /d "%~dp0"
echo ===================================================
echo [RABBIT] KHOI DONG DICH VU MUXINTANG WELLNESS SPA
echo ===================================================

:: Tu dong nap bien moi truong tu .env neu co
if exist .env (
    echo [+] Dang nap bien moi truong tu file .env...
    for /f "tokens=*" %%i in (.env) do (
        set %%i
    )
) else (
    echo [-] Khong tim thay file .env, su dung cau hinh mac dinh.
)

echo [+] Bat dau chay HTTP Server Node.js tai Port 8000...
start /b node "%~dp0\server.js"

echo [+] Cho 1.5 giay de Server khoi dong...
timeout /t 2 /nobreak > nul

echo [+] Mo trang chu Muxintang tren Trinh duyet...
start http://localhost:8000/index.html

echo ===================================================
echo [RABBIT] TIEN TRINH KHOI DONG HOAN TAT!
echo ===================================================
