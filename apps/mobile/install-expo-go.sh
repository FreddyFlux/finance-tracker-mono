#!/bin/bash

# Script to install Expo Go on iOS Simulator

echo "📱 Installing Expo Go on iOS Simulator..."
echo ""

# Get the booted simulator device
BOOTED_DEVICE=$(xcrun simctl list devices | grep "Booted" | head -1 | sed 's/.*(\([^)]*\)).*/\1/')

if [ -z "$BOOTED_DEVICE" ]; then
    echo "❌ No booted simulator found."
    echo "   Please boot a simulator first, then run this script again."
    echo ""
    echo "   You can boot a simulator by running:"
    echo "   open -a Simulator"
    exit 1
fi

echo "Found booted device: $BOOTED_DEVICE"
echo ""

# Try to install Expo Go via simctl (if we have the .app bundle)
# Otherwise, guide user to install via App Store

echo "📋 To install Expo Go:"
echo ""
echo "Option 1 (Recommended): Install via App Store in Simulator"
echo "   1. Make sure Simulator is open"
echo "   2. Open App Store app in the simulator"
echo "   3. Search for 'Expo Go'"
echo "   4. Install it"
echo "   5. Then run: npm run ios"
echo ""
echo "Option 2: Use expo start without auto-opening"
echo "   1. Run: npm run start"
echo "   2. Press 'i' to open iOS simulator"
echo "   3. Expo will prompt you to install Expo Go if needed"
echo ""
echo "Option 3: Build native app (requires Xcode setup)"
echo "   1. Run: npx expo run:ios"
echo "   2. This builds a native app without needing Expo Go"
