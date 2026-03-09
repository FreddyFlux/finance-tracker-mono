#!/bin/bash

# Script to fix iOS Simulator issues
# This script kills all simulator processes and restarts the CoreSimulatorService

echo "🔧 Fixing iOS Simulator..."
echo ""

# Kill all simulator-related processes
echo "1. Killing simulator processes..."
killall Simulator 2>/dev/null || true
killall -9 com.apple.CoreSimulator.CoreSimulatorService 2>/dev/null || true
killall -9 com.apple.iphonesimulator 2>/dev/null || true
pkill -f Simulator 2>/dev/null || true
pkill -f CoreSimulator 2>/dev/null || true

# Wait a moment for processes to fully terminate
echo "   Waiting for processes to terminate..."
sleep 3

# Try to restart CoreSimulatorService by opening Simulator app
echo "2. Restarting Simulator service..."
SIMULATOR_PATH="/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app"

if [ -d "$SIMULATOR_PATH" ]; then
    echo "   Opening Simulator app..."
    open "$SIMULATOR_PATH" 2>/dev/null
    sleep 2
else
    echo "   ⚠️  Simulator app not found at $SIMULATOR_PATH"
    echo "   Trying alternative method..."
    open -a Simulator 2>/dev/null || {
        echo "   ⚠️  Could not open Simulator app directly."
        echo "   Please try opening Xcode manually from Applications."
    }
fi

# Wait a bit for service to start
echo "   Waiting for service to initialize..."
sleep 5

# Check if simctl is working now
echo "3. Checking simulator status..."
if xcrun simctl list devices > /dev/null 2>&1; then
    echo "   ✅ Simulator service is now working!"
    echo ""
    echo "You can now run: npm run ios"
else
    echo "   ❌ Simulator service is still not responding."
    echo ""
    echo "📋 Additional steps to try:"
    echo ""
    echo "Option A: Restart Xcode"
    echo "   1. Open Xcode (if installed)"
    echo "   2. Quit Xcode completely (Cmd+Q)"
    echo "   3. Wait 5 seconds"
    echo "   4. Open Xcode again"
    echo "   5. Try: npm run ios"
    echo ""
    echo "Option B: Use sudo to kill the service"
    echo "   Run: sudo killall -9 com.apple.CoreSimulator.CoreSimulatorService"
    echo "   Wait 5 seconds, then try: npm run ios"
    echo ""
    echo "Option C: Restart your Mac"
    echo "   This will reset all simulator services"
    echo ""
    echo "Option D: Use Expo Go on a physical device"
    echo "   Run: npm run start"
    echo "   Then scan the QR code with Expo Go app on your iPhone"
fi
