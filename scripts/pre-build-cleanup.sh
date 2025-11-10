#!/bin/bash

# Pre-build cleanup script
# Removes any .backup files from frameworks to avoid validation errors

echo "Running pre-build cleanup..."

# Remove any .backup files from the project
find "${SRCROOT}/../node_modules" -name "*.backup" -type f -delete 2>/dev/null

# Clean up KontaktSDK framework specifically
KONTAKT_FRAMEWORK_DIR="${SRCROOT}/../node_modules/react-native-kontaktio/ios/KontaktSDK.framework"
if [ -d "$KONTAKT_FRAMEWORK_DIR" ]; then
  find "$KONTAKT_FRAMEWORK_DIR" -name "*.backup" -type f -delete 2>/dev/null
  echo "✅ Cleaned up KontaktSDK framework"
fi

# Verify no bitcode in KontaktSDK
KONTAKT_BINARY="${KONTAKT_FRAMEWORK_DIR}/KontaktSDK"
if [ -f "$KONTAKT_BINARY" ]; then
  if otool -l "$KONTAKT_BINARY" | grep -q "__LLVM"; then
    echo "⚠️  WARNING: KontaktSDK still contains bitcode!"
    echo "Running bitcode removal..."
    cd "${SRCROOT}/.."
    ./scripts/strip-bitcode.sh
  else
    echo "✅ KontaktSDK has no bitcode"
  fi
fi

echo "✅ Pre-build cleanup completed"

