@echo off
echo ========================================
echo  GoPay - Build APK
echo ========================================
echo.

echo 1. Building web assets...
call npx vite build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Web build failed
    exit /b 1
)

echo.
echo 2. Syncing with Capacitor...
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Capacitor sync failed
    exit /b 1
)

echo.
echo 3. Building Android APK...
cd android
call gradlew assembleDebug
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Android build failed
    echo.
    echo Make sure you have:
    echo   - Android SDK installed
    echo   - local.properties pointing to your SDK path
    echo   - Java 17+
    cd ..
    exit /b 1
)

echo.
echo ========================================
echo  APK generated successfully!
echo  Location: android/app/build/outputs/apk/debug/
echo ========================================
cd ..
pause
