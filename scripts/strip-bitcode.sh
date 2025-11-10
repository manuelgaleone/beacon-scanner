#!/bin/bash

# Script to remove bitcode from KontaktSDK framework
# This is required because Apple no longer accepts apps with bitcode

echo "Checking KontaktSDK framework for bitcode..."

KONTAKT_FRAMEWORK="./node_modules/react-native-kontaktio/ios/KontaktSDK.framework/KontaktSDK"

if [ -f "$KONTAKT_FRAMEWORK" ]; then
  # Check if bitcode exists
  if otool -l "$KONTAKT_FRAMEWORK" | grep -q "__LLVM"; then
    echo "Bitcode found in KontaktSDK. Removing..."
    
    # Create backup if it doesn't exist
    if [ ! -f "${KONTAKT_FRAMEWORK}.backup" ]; then
      cp "$KONTAKT_FRAMEWORK" "${KONTAKT_FRAMEWORK}.backup"
      echo "Backup created at ${KONTAKT_FRAMEWORK}.backup"
    fi
    
    # Strip bitcode
    xcrun bitcode_strip -r "$KONTAKT_FRAMEWORK" -o "$KONTAKT_FRAMEWORK"
    
    if [ $? -eq 0 ]; then
      echo "✅ Bitcode successfully removed from KontaktSDK"
    else
      echo "❌ Failed to remove bitcode from KontaktSDK"
      exit 1
    fi
  else
    echo "✅ KontaktSDK already has no bitcode"
  fi
else
  echo "⚠️  KontaktSDK framework not found at $KONTAKT_FRAMEWORK"
fi

