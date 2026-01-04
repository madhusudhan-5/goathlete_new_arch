#!/bin/bash
echo "Logs are being captured..."
echo "Click the Pre-Register or New Venue button on your phone NOW"
echo "Waiting 30 seconds for crash..."
adb logcat -d *:E ReactNativeJS:V ReactNative:V AndroidRuntime:V > crash_logs.txt 2>&1
echo "Logs saved to crash_logs.txt"
cat crash_logs.txt

