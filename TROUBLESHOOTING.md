# 🔧 Troubleshooting Guide - Dostoevsky Chess

Common issues and their solutions.

---

## 🌐 Game Won't Load

### Symptom
Blank page or "Cannot find file" error

### Solutions
1. **Check file paths**
   - All files must be in same directory
   - Or maintain the exact folder structure
   
2. **Try different browser**
   - Chrome, Firefox, Safari, Edge all work
   - Make sure JavaScript is enabled
   
3. **Hard refresh**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
   
4. **Check browser console**
   - Press `F12` to open developer tools
   - Look for red errors
   - Google the error message

---

## 🤖 Stockfish AI Not Working

### Symptom
AI doesn't move, or makes random moves, or "AI unavailable" message

### This is Normal If:
- Stockfish CDN is temporarily down
- Slow internet connection
- Browser doesn't support Web Workers

### Solutions
1. **Check internet connection**
   - Stockfish loads from CDN
   - Needs active connection
   
2. **Try different difficulty**
   - Lower depth might work better
   - Start with "Beginner" level
   
3. **Fallback works fine**
   - Random move AI still functional
   - Still plays legal moves
   - Just not as smart

### Not a Bug
The game gracefully falls back to random AI if Stockfish unavailable. This is intentional to keep the game playable.

---

## 🌐 Multiplayer Won't Connect

### Symptom
"Connection error" or opponent can't join room

### Common Causes
1. **Firewall blocking WebRTC**
2. **Different URLs** (http vs https)
3. **Network restrictions** (corporate/school)
4. **Browser incompatibility**

### Solutions

#### For Room Creator:
1. **Share just the room code**
   - NOT the full URL
   - Just the 6-letter code
   
2. **Keep your browser open**
   - Don't close the tab
   - Don't refresh while waiting
   
3. **Check connection status**
   - Should say "Connected"
   - If not, try creating new room

#### For Room Joiner:
1. **Use exact same URL**
   - If host uses https, you use https
   - Must be same domain
   
2. **Enter code correctly**
   - Codes are case-sensitive
   - No spaces
   
3. **Wait for connection**
   - May take 5-10 seconds
   - Be patient

#### For Both:
1. **Check firewall**
   - Allow WebRTC connections
   - Disable VPN temporarily
   
2. **Try different network**
   - Mobile hotspot
   - Different WiFi
   
3. **Use modern browser**
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   
4. **Disable browser extensions**
   - Ad blockers can interfere
   - Privacy extensions too
   - Try incognito mode

---

## 🎮 Game Freezes or Lags

### Symptom
Board doesn't respond, or moves are slow

### Solutions
1. **Close other tabs**
   - Free up browser memory
   
2. **Restart browser**
   - Clear cache and cookies
   
3. **Check CPU usage**
   - AI mode uses more processing
   - Lower AI difficulty
   
4. **Update browser**
   - Use latest version

---

## ♟️ Illegal Move Accepted / Legal Move Rejected

### This Should Never Happen
Chess.js validation is very robust.

### If It Does:
1. **Report as bug**
   - Note the position (FEN)
   - Note the attempted move
   - Screenshot if possible
   
2. **Reset game**
   - Click "New Game"
   - Or refresh page

### Known Edge Case
- Pawn promotion might auto-queen
- This is intentional for simplicity

---

## 📱 Mobile Issues

### Small Board
**Solution**: Pinch to zoom, or use tablet/desktop

### Pieces Hard to Click
**Solution**: 
- Tap carefully on piece center
- Use landscape mode
- Zoom in

### Chat Keyboard Covers Board
**Solution**:
- Type message first
- Then scroll to see board
- Or use desktop for chat

---

## 🔄 Board Upside Down

### Symptom
Black pieces at bottom (when you're white)

### Solution
Click the "Flip Board" button (⇅)

Or press `F` key

---

## 🚫 Can't Undo Move

### In Online Multiplayer
**This is intentional** - can't undo in multiplayer

### In AI Mode
- Should undo both your move and AI move
- If not working, might be game over
- Try "New Game" instead

### In Local Mode
- Works anytime before game over
- Press `Ctrl + Z` or click button

---

## 💬 Chat Not Working (Multiplayer)

### Symptom
Messages don't send/appear

### Solutions
1. **Check connection**
   - Must see "Connected" status
   
2. **Try again**
   - Type message
   - Press Enter or click Send
   
3. **Reconnect**
   - Close and rejoin room
   - Create new room

---

## 🎨 Styling Issues

### Fonts Don't Load
**Solution**: Check internet connection (Google Fonts CDN)

### Colors Look Wrong
**Solution**: 
- Clear browser cache
- Hard refresh
- Check if dark mode extension interfering

### Layout Broken
**Solution**:
- Try different browser
- Check browser zoom (should be 100%)
- Ensure CSS file loaded

---

## 📊 GitHub Pages Issues

### 404 Error After Deployment
**Solutions**:
1. Wait 5 minutes (deployment takes time)
2. Check repository is public
3. Check Pages enabled in settings
4. Use correct URL format

### Game Works Locally But Not Online
**Solutions**:
1. Check all files uploaded
2. Check file names (case-sensitive)
3. Check paths in HTML files
4. Check browser console on live site

### Changes Don't Appear
**Solutions**:
1. Wait for GitHub Actions (if using)
2. Hard refresh browser
3. Clear browser cache
4. Check commit pushed successfully

---

## 🔐 Security Warnings

### "Not Secure" in Chrome
- Normal if using `file://` locally
- Won't happen on GitHub Pages (uses HTTPS)

### "Mixed Content" Warning
- Happens if mixing HTTP and HTTPS
- Use all HTTPS CDN links
- GitHub Pages is HTTPS by default

---

## 🐛 JavaScript Errors

### "Chess is not defined"
**Solution**: Chess.js CDN didn't load
- Check internet connection
- Check script tag in HTML
- Try different CDN URL

### "Peer is not defined"  
**Solution**: PeerJS CDN didn't load
- Same as above

### "Stockfish is not defined"
**Solution**: This is normal
- Game falls back to random AI
- Not critical

---

## 🎯 Move Highlighting Issues

### Valid Moves Not Showing
**Cause**: Probably not your turn (in multiplayer)

### Check Highlight Stuck
**Solution**: Refresh page or click elsewhere

### Last Move Not Highlighted
**Solution**: This is visual only, doesn't affect gameplay

---

## 🔊 No Sound Effects

### Expected
The game doesn't have sound effects by default.

### To Add:
See CONTRIBUTING.md for enhancement ideas.

---

## 📝 Notation Issues

### FEN Looks Wrong
- Copy and validate at lichess.org/editor
- If wrong, report as bug

### PGN Missing Moves
- Should update after each move
- If not, might be JavaScript error

---

## ⌨️ Keyboard Shortcuts Not Working

### Solutions
1. **Click on game area first**
   - Focus must be on page
   
2. **Check key combination**
   - Ctrl+Z (Windows/Linux)
   - Cmd+Z (Mac)
   
3. **Browser might intercept**
   - Some shortcuts reserved
   - Use UI buttons instead

---

## 🌍 Browser Compatibility

### Fully Supported
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

### Not Supported
- Internet Explorer ❌
- Very old mobile browsers ❌

### Partial Support
- Older browsers might work but with issues
- Update to latest version

---

## 💾 LocalStorage Full

### Symptom
Game mode not saving between pages

### Solution
- Clear browser data
- Or use incognito mode

---

## 🔄 Page Refresh Loses Game

### Expected Behavior
- Refreshing loses current game
- This is by design (no persistence)

### Future Enhancement
- Save games to LocalStorage
- See CONTRIBUTING.md

---

## 🤔 General Debugging Steps

1. **Check browser console** (F12)
2. **Try incognito mode** (rules out extensions)
3. **Try different browser** (rules out browser-specific issues)
4. **Check internet connection** (CDN dependencies)
5. **Hard refresh** (Ctrl+Shift+R)
6. **Clear cache** (or incognito mode)
7. **Check GitHub Pages status** (if deployed)
8. **Read error messages** (they're usually helpful)

---

## 📞 Still Having Issues?

### Steps to Report a Bug

1. **Check if it's in this guide**
   - Might already have solution
   
2. **Search existing issues**
   - GitHub Issues tab
   - Someone might have same problem
   
3. **Create new issue**
   - Describe the problem clearly
   - Include:
     - Browser & version
     - Operating system
     - Steps to reproduce
     - Screenshot if applicable
     - Console errors
   
4. **Be patient**
   - Maintainers are volunteers
   - Will respond when able

---

## 🎓 Not a Bug, It's a Feature

### AI Makes "Bad" Moves at Low Difficulty
- Intentional! Lower depths = weaker play
- Try higher difficulty

### Can't Undo in Multiplayer
- Intentional! Would be unfair
- Part of online chess rules

### Board Resets When Leaving Page
- No persistence implemented
- Future enhancement

### Multiplayer Needs Both Players Online
- P2P requires both connected
- Can't do otherwise without server

---

## 🆘 Emergency Fixes

### Nothing Works
1. Clear all browser data
2. Re-download files
3. Try different browser
4. Restart computer

### Multiplayer Completely Broken
1. Check firewall settings
2. Try mobile hotspot
3. Use different network
4. Contact ISP (might block P2P)

### AI Always Fails
1. Check Stockfish CDN status
2. Try VPN
3. Accept random AI fallback

---

## 📚 Helpful Resources

- **Chess Rules**: wikipedia.org/wiki/Rules_of_chess
- **Chess.js**: github.com/jhlywa/chess.js
- **PeerJS**: peerjs.com/docs
- **WebRTC Debugging**: webrtc.github.io/samples/

---

## ✅ When Everything Works

If you've solved your issue:
- ⭐ Star the repository
- 📢 Share with friends
- 🎮 Enjoy playing chess!

---

*"Man is sometimes extraordinarily, passionately, in love with suffering."*
— Notes from Underground

**Happy troubleshooting! May your bugs be few and your checkmates many. ♟️**
