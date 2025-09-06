# Troubleshooting Guide

## Common Issues and Solutions

### 🔐 Authentication Issues

#### Twitch Sign-In Not Working (Page Reloads)
**Symptoms:** Clicking "Sign in with Twitch" reloads the page but doesn't redirect to Twitch OAuth

**Root Cause:** Platform interference - both providers were trying to process OAuth tokens simultaneously.

**Fixes Applied:**
1. **Platform Isolation**: Each provider now only processes tokens for its own platform
2. **Improved OAuth Handling**: Better token processing and error handling
3. **Clear Platform Selection**: Switching platforms now clears other platform data
4. **Enhanced Debugging**: Added comprehensive console logging

**Debug Information:**
- Look for "TwitchChatProvider initializing..." in console
- Check for "Found OAuth token in URL, processing..." during OAuth callback
- Verify CLIENT_ID is not empty/undefined

**If Still Having Issues:**
1. Clear localStorage completely: `localStorage.clear()` in browser console
2. Refresh page and try again
3. Check that your Twitch app redirect URI exactly matches: `http://localhost:3000`

#### Kick OAuth Issues
**Symptoms:** 
- "Token validation failed: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
- Kick authentication redirects but doesn't work properly

**Root Causes & Fixes:**
1. **API Endpoint Issues**: Kick's API might return HTML instead of JSON in some cases
2. **OAuth URL Corrected**: Changed from `/oauth2/authorize` to `/oauth`  
3. **Scopes Updated**: Now uses proper scopes matching your Kick app configuration
4. **Fallback Authentication**: If API validation fails, uses mock user for development

**Kick App Configuration Required:**
Your `.env.local` should have:
```bash
NEXT_PUBLIC_KICK_CLIENT_ID=01K4D3WQC29MNJWGZZTQNMD6N3
NEXT_PUBLIC_KICK_REDIRECT_URI=http://localhost:3000
```

**Kick OAuth Scopes Used:**
- `user:read` - Read user information
- `stream_key:read` - Read stream key  
- `channel:read` - Read channel information
- `chat:write` - Write to chat
- `events:read` - Subscribe to events
- `moderation:read` - Execute moderation actions

**Debug Information:**
- Look for "KickChatProvider initializing..." in console
- "Kick API validation failed, using mock user for development" means fallback is working
- Check that your Kick app redirect URI matches exactly

### 🖼️ Image Loading Issues

#### Next.js Image Configuration Error
**Error:** `Invalid src prop on next/image, hostname not configured`

**Solution:** Already fixed in `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  images: {
    domains: ["static-cdn.jtvnw.net", "via.placeholder.com"],
  },
};
```

#### Missing Profile Images
**Behavior:** Users without profile images now show their initials in a colored circle instead of broken images

### 🔧 Development Setup

#### Environment Variables
Create `.env.local` with:
```bash
# Twitch (Required for Twitch functionality)
NEXT_PUBLIC_TWITCH_CLIENT_ID=your_twitch_client_id
NEXT_PUBLIC_TWITCH_REDIRECT_URI=http://localhost:3000

# Kick (Optional - uses mock auth if not provided)
NEXT_PUBLIC_KICK_CLIENT_ID=your_kick_client_id  
NEXT_PUBLIC_KICK_REDIRECT_URI=http://localhost:3000
```

#### Platform Testing
1. **Clear Browser Data**: Clear localStorage to reset platform selection
2. **Test Platform Switching**: 
   - Select Twitch → Should redirect to Twitch OAuth (if configured)
   - Select Kick → Should use mock authentication (if no CLIENT_ID)
3. **Console Debugging**: Check browser console for authentication flow logs

### 🚀 Production Deployment

#### Domain Configuration
Update environment variables for production:
```bash
NEXT_PUBLIC_TWITCH_REDIRECT_URI=https://yourdomain.com
NEXT_PUBLIC_KICK_REDIRECT_URI=https://yourdomain.com
```

#### OAuth App Settings
- **Twitch**: Add production domain to redirect URIs at https://dev.twitch.tv/console/apps
- **Kick**: Add production domain to your Kick developer app

### 🐛 Common Error Messages

#### "CLIENT_ID is not configured"
- Missing or invalid environment variables
- Restart development server after adding variables
- Check variable names match exactly (NEXT_PUBLIC_TWITCH_CLIENT_ID)

#### "Invalid redirect URI" 
- OAuth app redirect URI doesn't match environment variable
- Update OAuth app settings or environment variable

#### Platform provider loading errors
- Network connectivity issues
- Check browser console for specific error details
- Try refreshing the page

### 📊 Testing Chat Commands

#### Both Platforms Support:
- `!showwheel` - Show wheel in OBS
- `!hidewheel` - Hide wheel in OBS  
- `!spin` - Spin the wheel (moderators only)
- `!removeentry username` - Remove participant (moderators only)
- Plus all other existing commands

#### Mock Chat Testing
For development without live chat:
1. Sign in with either platform
2. Use manual controls to add participants
3. Test wheel functionality
4. Use OBS controls to test overlay integration

### 🔄 Reset/Recovery

#### Complete Reset
```bash
# Clear all stored data
localStorage.clear()

# Or in browser console:
localStorage.removeItem('selected-platform')
localStorage.removeItem('twitch_token')  
localStorage.removeItem('twitch_user')
localStorage.removeItem('kick_token')
localStorage.removeItem('kick_user')
```

#### Switching Platforms
1. Log out from current platform
2. Clear localStorage (or refresh page)
3. Select different platform
4. Sign in with new platform

Need help? Check the browser console for detailed error messages and debugging information.