@echo off
echo ================================
echo Admin Panel Quick Start Script
echo ================================
echo.

echo Step 1: Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js: Found
node --version
echo.

echo Step 2: Checking PostgreSQL installation...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: PostgreSQL not found in PATH
    echo Make sure PostgreSQL is installed and added to PATH
    echo.
) else (
    echo PostgreSQL: Found
    psql --version
    echo.
)

echo Step 3: Installing backend dependencies...
cd backend
if not exist node_modules (
    echo Installing npm packages...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
) else (
    echo Dependencies already installed
)
echo.

echo Step 4: Checking configuration...
if not exist .env (
    echo WARNING: .env file not found!
    echo Please configure backend/.env file before starting
    echo.
) else (
    echo .env file found
)
echo.

echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next steps:
echo 1. Configure PostgreSQL database:
echo    psql -U postgres -f backend/config/database.sql
echo.
echo 2. Update backend/.env with your database credentials
echo.
echo 3. Start the backend server:
echo    cd backend
echo    npm run dev
echo.
echo 4. Open the website in your browser
echo    http://localhost:5000/
echo    Admin: http://localhost:5000/admin/admin-login.html
echo.
echo Default login credentials:
echo    Email: admin@company.com
echo    Password: admin123
echo.
pause
