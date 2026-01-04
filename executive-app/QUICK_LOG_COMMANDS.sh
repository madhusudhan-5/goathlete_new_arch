#!/bin/bash

# Quick commands to get Android logs
# Run these commands in your terminal

echo "=== Android Log Commands ==="
echo ""
echo "1. Check if device is connected:"
echo "   adb devices"
echo ""
echo "2. Clear logs and view errors only:"
echo "   adb logcat -c && adb logcat *:E"
echo ""
echo "3. View React Native errors:"
echo "   adb logcat *:E ReactNativeJS:V ReactNative:V"
echo ""
echo "4. Save logs to file:"
echo "   adb logcat > crash_logs.txt"
echo ""
echo "5. View all logs (filtered):"
echo "   adb logcat | grep -i 'goathlete\|reactnative'"
echo ""

