# Google OAuth Setup Guide

This guide will help you set up Google Sign-In for the ListroApp.

## Prerequisites

1. Google Cloud Console account
2. Expo/React Native development environment
3. Android/iOS development setup

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Sign-In API)

## Step 2: Create OAuth 2.0 Credentials

1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Create credentials for each platform:

### Web Application (Required)

- Application type: Web application
- Name: ListroApp Web
- Authorized redirect URIs: (leave empty for now)
- Copy the **Client ID** - this is your `GOOGLE_WEB_CLIENT_ID`

### Android Application

- Application type: Android
- Name: ListroApp Android
- Package name: `com.sahin05.listroapp` (from app.config.js)
- SHA-1 certificate fingerprint: (get from your keystore)
- Copy the **Client ID** - this is your `GOOGLE_ANDROID_CLIENT_ID`

### iOS Application

- Application type: iOS
- Name: ListroApp iOS
- Bundle ID: `com.sahin05.listroapp` (from app.config.js)
- Copy the **Client ID** - this is your `GOOGLE_IOS_CLIENT_ID`

## Step 3: Configure Environment Variables

Add these environment variables to your `.env` file or app.config.js:

```bash
# Google OAuth Configuration
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

## Step 4: Get SHA-1 Fingerprint (Android)

### For Development (Debug Keystore)

```bash
# On macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# On Windows
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### For Production (Release Keystore)

```bash
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

## Step 5: Test the Implementation

1. Start your development server
2. Navigate to the auth screen
3. Tap "Continue with Google"
4. Complete the Google Sign-In flow
5. Verify that the user is authenticated and redirected to the appropriate dashboard

## Troubleshooting

### Common Issues

1. **"Google Sign-In is not available"**

   - Check if Google Play Services are installed (Android)
   - Verify your SHA-1 fingerprint is correct
   - Ensure the package name matches your app.config.js

2. **"Invalid client ID"**

   - Verify your client IDs are correct
   - Check if the OAuth consent screen is configured
   - Ensure the API is enabled

3. **"Sign-in was cancelled by user"**
   - This is normal behavior when user cancels the sign-in flow
   - No action needed

### Debug Steps

1. Check console logs for detailed error messages
2. Verify environment variables are loaded correctly
3. Test on both Android and iOS devices
4. Ensure your app is properly signed (for production)

## Security Notes

1. Never commit your `.env` file to version control
2. Use different client IDs for development and production
3. Regularly rotate your OAuth credentials
4. Monitor your Google Cloud Console for suspicious activity

## Additional Resources

- [Google Sign-In for React Native](https://github.com/react-native-google-signin/google-signin)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo Google Sign-In Guide](https://docs.expo.dev/guides/google-authentication/)
