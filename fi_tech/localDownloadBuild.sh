#!/bin/bash

# Step 1: Set archive path
ARCHIVE_DIR=~/Library/Developer/Xcode/Archives/2025-06-30

# Step 2: Find latest .xcarchive directory (not file)
LATEST_ARCHIVE=$(find "$ARCHIVE_DIR" -type d -name "*.xcarchive" -print0 | xargs -0 ls -td | head -n 1)

if [ -z "$LATEST_ARCHIVE" ]; then
  echo "❌ No .xcarchive folder found."
  exit 1
fi

echo "✅ Found archive: $LATEST_ARCHIVE"

# Step 3: Rename it to a consistent name
RENAMED_ARCHIVE="$ARCHIVE_DIR/fitech_archive.xcarchive"

if [ "$LATEST_ARCHIVE" != "$RENAMED_ARCHIVE" ]; then
  mv "$LATEST_ARCHIVE" "$RENAMED_ARCHIVE"
  echo "✅ Renamed to: $RENAMED_ARCHIVE"
else
  echo "📁 Archive already has correct name: $RENAMED_ARCHIVE"
fi

# Step 4: Locate .app file
APP_PATH="$RENAMED_ARCHIVE/Products/Applications"
APP_FILE=$(find "$APP_PATH" -name "*.app" | head -n 1)

if [ ! -d "$APP_FILE" ]; then
  echo "❌ .app not found inside archive at $APP_PATH"
  exit 1
fi

echo "✅ Found .app at: $APP_FILE"

# Step 5: Deploy to connected device
echo "📲 Installing to connected iOS device..."
ios-deploy --bundle "$APP_FILE" --justlaunch

echo "✅ Deployment complete!"
