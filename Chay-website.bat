@echo off
setlocal
cd /d "%~dp0"
if not exist "index.html" (
  if exist "dist\index.html" (
    cd dist
  ) else (
    echo Khong tim thay index.html. Hay giai nen toan bo thu muc website.
    pause
    exit /b 1
  )
)
py -3 --version >nul 2>nul
if not errorlevel 1 goto run_py
python --version >nul 2>nul
if not errorlevel 1 goto run_python
echo Can Python 3 de chay file nay.
echo Ban cung co the mo thu muc bang VS Code va dung Open with Live Server.
echo Xem README.md de biet huong dan.
pause
exit /b 1

:run_py
echo Mo http://127.0.0.1:5500/index.html trong trinh duyet.
echo Giu cua so nay mo khi su dung website. Nhan Ctrl+C de dung.
py -3 -m http.server 5500 --bind 127.0.0.1
goto stopped

:run_python
echo Mo http://127.0.0.1:5500/index.html trong trinh duyet.
echo Giu cua so nay mo khi su dung website. Nhan Ctrl+C de dung.
python -m http.server 5500 --bind 127.0.0.1

:stopped
echo May chu da dung. Neu cong 5500 dang duoc dung, hay dong phien cu.
pause
