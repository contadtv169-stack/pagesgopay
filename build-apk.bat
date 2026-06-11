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
echo 3. Patching Java version to 17...
powershell -Command "(Get-Content 'node_modules\@capacitor\android\capacitor\build.gradle') -replace 'VERSION_21', 'VERSION_17' | Set-Content 'node_modules\@capacitor\android\capacitor\build.gradle'"
powershell -Command "(Get-Content 'android\app\capacitor.build.gradle') -replace 'VERSION_21', 'VERSION_17' | Set-Content 'android\app\capacitor.build.gradle'"

echo.
echo 4. Building Android APK...
cd android
call gradlew assembleDebug
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Android build failed
    echo.
    echo Make sure you have:
    echo   - Android SDK installed
    echo   - local.properties pointing to your SDK path
    echo   - Java 17+ (install from https://adoptium.net/)
    cd ..
    exit /b 1
)

cd ..

echo.
echo ========================================
echo  APK generated successfully!
echo  Location: android/app/build/outputs/apk/debug/app-debug.apk
echo  Copy: GoPay-APK.apk
echo ========================================
echo.
copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "GoPay-APK.apk"
echo  APK copied to GoPay-APK.apk
pause
