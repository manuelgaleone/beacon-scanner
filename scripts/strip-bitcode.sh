#!/bin/bash

# Script to remove bitcode from KontaktSDK framework
# This is required because Apple no longer accepts apps with bitcode

echo "Checking KontaktSDK framework for bitcode..."

KONTAKT_FRAMEWORK="./node_modules/react-native-kontaktio/ios/KontaktSDK.framework/KontaktSDK"
TEMP_FILE="/tmp/KontaktSDK_temp_$$"

if [ -f "$KONTAKT_FRAMEWORK" ]; then
  # Remove any existing .backup files to avoid including them in the bundle
  if [ -f "${KONTAKT_FRAMEWORK}.backup" ]; then
    echo "Removing old backup file..."
    rm -f "${KONTAKT_FRAMEWORK}.backup"
  fi
  
  # Check if bitcode exists
  if otool -l "$KONTAKT_FRAMEWORK" | grep -q "__LLVM"; then
    echo "Bitcode found in KontaktSDK. Removing..."
    
    # Strip bitcode using a temporary file (no backup in the framework directory)
    xcrun bitcode_strip -r "$KONTAKT_FRAMEWORK" -o "$TEMP_FILE"
    
    if [ $? -eq 0 ]; then
      # Replace original with stripped version
      mv "$TEMP_FILE" "$KONTAKT_FRAMEWORK"
      echo "✅ Bitcode successfully removed from KontaktSDK"
    else
      echo "❌ Failed to remove bitcode from KontaktSDK"
      rm -f "$TEMP_FILE"
      exit 1
    fi
  else
    echo "✅ KontaktSDK already has no bitcode"
  fi
else
  echo "⚠️  KontaktSDK framework not found at $KONTAKT_FRAMEWORK"
fi

# Clean up any backup files that might have been created
find ./node_modules/react-native-kontaktio/ios/KontaktSDK.framework -name "*.backup" -type f -delete 2>/dev/null

echo "✅ Cleanup completed"

