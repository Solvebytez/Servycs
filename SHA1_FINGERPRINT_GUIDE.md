# SHA-1 Fingerprint Guide for Google Sign-In

The SHA-1 fingerprint is required to configure Google Sign-In for Android. Here's how to get it for different scenarios.

## 🔍 What is SHA-1 Fingerprint?

SHA-1 fingerprint is a unique identifier for your app's signing certificate. Google uses it to verify that your app is authorized to use Google Sign-In.

## 📱 Getting SHA-1 for Development (Debug Keystore)

### Method 1: Using keytool (Recommended)

#### For Windows:

```bash
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### For macOS/Linux:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Method 2: Using Gradle (Alternative)

Add this to your `android/app/build.gradle` file:

```gradle
android {
    ...
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    ...
}
```

Then run:

```bash
cd android
./gradlew signingReport
```

### Method 3: Using Expo CLI

If you're using Expo:

```bash
expo credentials:manager -p android
```

## 🏭 Getting SHA-1 for Production (Release Keystore)

### If you have a release keystore:

```bash
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

### If you don't have a release keystore yet:

1. **Generate a new keystore:**

```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Get SHA-1 from the new keystore:**

```bash
keytool -list -v -keystore my-release-key.keystore -alias my-key-alias
```

## 📋 Step-by-Step Instructions

### Step 1: Open Terminal/Command Prompt

### Step 2: Navigate to your project directory

```bash
cd D:\Apps\listroProject\listroApp
```

### Step 3: Run the appropriate command

#### For Development (Debug):

```bash
# Windows
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android

# macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Step 4: Look for SHA1 in the output

You'll see output like this:

```
Alias name: androiddebugkey
Creation date: Jan 1, 2024
Entry type: PrivateKeyEntry
Certificate chain length: 1
Certificate[1]:
Owner: CN=Android Debug, O=Android, C=US
Issuer: CN=Android Debug, O=Android, C=US
Serial number: 1
Valid from: Mon Jan 01 00:00:00 UTC 2024 until: Wed Dec 31 23:59:59 UTC 2031
Certificate fingerprints:
         SHA1: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
         SHA256: 11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00
```

**Copy the SHA1 value** (the one after "SHA1:")

## 🔧 Common Issues and Solutions

### Issue 1: "keytool not found"

**Solution:** Make sure Java JDK is installed and added to PATH

```bash
# Check if Java is installed
java -version

# If not installed, download from: https://www.oracle.com/java/technologies/downloads/
```

### Issue 2: "keystore not found"

**Solution:** The debug keystore is created when you first build an Android app

```bash
# Try building your app first
npx expo run:android
# or
cd android && ./gradlew assembleDebug
```

### Issue 3: "Permission denied"

**Solution:** Run terminal as administrator (Windows) or use sudo (macOS/Linux)

## 📱 Using SHA-1 in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
4. Choose "Android" as application type
5. Enter your package name: `com.sahin05.listroapp`
6. Enter your SHA-1 fingerprint: `AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD`
7. Click "Create"

## 🚀 Quick Commands Reference

### Development SHA-1:

```bash
# Windows
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android

# macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Production SHA-1:

```bash
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

### Generate new keystore:

```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

## ⚠️ Important Notes

1. **Keep your keystore safe** - losing it means you can't update your app
2. **Use different SHA-1s** for development and production
3. **Add both SHA-1s** to Google Cloud Console if you want to test both environments
4. **SHA-1 is case-insensitive** but include the colons (:)

## 🔍 Verification

After adding SHA-1 to Google Cloud Console, test your Google Sign-In:

1. Build and run your app
2. Try Google Sign-In
3. Check console logs for any authentication errors
4. If successful, you should see the Google Sign-In flow working
