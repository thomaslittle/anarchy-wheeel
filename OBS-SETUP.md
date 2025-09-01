# 🎯 OBS Setup Guide for Twitch Wheel Giveaway

This guide will help you set up the Twitch Wheel Giveaway as a Browser Source in OBS Studio for professional streaming.

## 🚀 Quick Setup

### Step 1: Connect Your Twitch Account
1. Visit `http://localhost:3000` in your browser
2. Click "Sign in with Twitch" and authorize the application
3. Connect to your Twitch chat with your desired entry keyword (default: `!enter`)

### Step 2: Add Browser Source to OBS
1. Open OBS Studio
2. In your Scene, click the "+" to add a new source
3. Select "Browser Source"
4. Create a new source or use existing
5. Configure the Browser Source:
   - **URL**: `http://localhost:3000/transparent`
   - **Width**: `1920` (or your stream resolution width)
   - **Height**: `1080` (or your stream resolution height)
   - ✅ **Check "Shutdown source when not visible"**
   - ✅ **Check "Refresh browser when scene becomes active"**

## 🎨 Layout Modes

### Simple Mode (Default)
- Clean, centered wheel perfect for overlays
- Minimal UI elements
- Perfect for smaller overlay areas

### Drag Mode
- Access all controls and panels
- Fully customizable layout
- Position elements anywhere on screen
- Lock elements in place when satisfied

To enable Drag Mode:
1. Click the layout toggle button (📐) in the top-right corner
2. Drag sections to desired positions
3. Use the Layout Control Panel to show/hide sections
4. Lock sections in place to prevent accidental movement
5. Exit drag mode when layout is perfect

## 🎮 Stream Controls

### Chat Commands (Moderators/Broadcaster only)
- `!spin` - Spin the wheel
- `!addentry [username]` - Manually add someone to the wheel
- `!removewinner` - Remove the most recent winner
- `!weight [username] [0.1-10]` - Set winner probability for a user

### Manual Controls
- Add participants manually
- Remove the last winner
- Clear all participants
- Adjust individual participant weights

## 🎨 Customization

### Wheel Appearance
- **Colors**: Customize segment colors
- **Winner Text**: Personalize the celebration message
- **Spin Duration**: Adjust how long the wheel spins
- **Themes**: Switch between light and dark modes

### OBS-Specific Features
- **Transparent Background**: Perfect integration with your stream
- **Text Shadows**: Ensures readability over any background  
- **Enhanced Visibility**: Optimized colors and contrasts
- **Responsive Layout**: Works with any stream resolution

## 🔊 Audio Settings

The wheel includes built-in sound effects:
- **Tick Sounds**: During wheel spinning
- **Celebration Sound**: When a winner is selected
- **UI Feedback**: For button interactions

Toggle sounds using the speaker button (🔊) in the top-right corner.

## 💾 Persistent Data

Your data is automatically saved and restored:
- **Participants**: Maintained across browser sessions
- **Wheel Settings**: Colors, text, duration preferences  
- **Layout Positions**: Drag mode positions remembered
- **Twitch Settings**: Entry keyword and preferences
- **Theme & Audio**: UI preferences preserved

## 🎯 Pro Tips

### For Streaming
1. **Test First**: Always test the wheel before going live
2. **Backup Plan**: Have a manual backup method for selecting winners
3. **Clear Instructions**: Tell viewers how to enter (`!enter` by default)
4. **Moderate Actively**: Use moderator commands to manage entries

### For Better Visibility in OBS
1. **High Contrast Backgrounds**: The wheel works best over darker backgrounds
2. **Size Appropriately**: Make sure text is readable at your stream resolution
3. **Position Strategically**: Don't cover important game UI elements
4. **Test Audio Levels**: Ensure wheel sounds don't overpower your voice

### Layout Optimization
1. **Drag Mode Setup**: Use drag mode to create your perfect layout
2. **Hide Unused Sections**: Remove clutter by hiding unnecessary panels
3. **Lock Important Elements**: Prevent accidental movement of key components
4. **Save Layouts**: Your positions are automatically saved

## 🛠️ Troubleshooting

### Browser Source Not Loading
- Check that the development server is running (`pnpm dev`)
- Verify the URL is correct: `http://localhost:3000/transparent`
- Try refreshing the browser source in OBS

### Transparent Background Not Working
- Ensure you're using `/transparent` route, not the main page
- Check OBS Browser Source settings are configured correctly
- Try refreshing the source or restarting OBS

### Data Not Persisting
- Check browser localStorage permissions
- Ensure you're accessing from the same domain/port
- Clear cache if experiencing issues, then reconfigure

### Twitch Connection Issues
- Verify Twitch OAuth credentials in environment variables
- Check network connectivity
- Try reconnecting from the main page

## 📋 Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_TWITCH_CLIENT_ID=your_twitch_client_id
NEXT_PUBLIC_TWITCH_REDIRECT_URI=http://localhost:3000
```

## 🎬 Going Live Checklist

- [ ] Twitch account connected
- [ ] Entry keyword set (announce to chat)
- [ ] OBS Browser Source configured 
- [ ] Wheel positioned correctly in scene
- [ ] Audio levels tested
- [ ] Chat commands explained to moderators
- [ ] Backup winner selection method ready

## 🔄 Updates & Maintenance

- Participant list automatically clears when appropriate
- Settings persist across stream sessions
- Regular testing recommended before important streams
- Keep the app updated for best performance

---

**Enjoy your professional giveaway streams! 🎉**

Need help? Check the main application at `http://localhost:3000` for the full interface and settings.