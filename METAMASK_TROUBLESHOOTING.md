# MetaMask Popup Troubleshooting Guide

## Common Issues and Solutions

### 1. **Popup Blocked by Browser**
**Symptoms:** MetaMask popup doesn't appear after clicking "Connect with MetaMask"

**Solutions:**
- Check if your browser is blocking popups for this site
- Look for a popup blocker icon in the address bar
- Add the site to your browser's popup allowlist
- **Chrome/Edge:** Click the popup icon in the address bar → "Always allow popups from this site"
- **Firefox:** Click the shield icon → "Disable Blocking for This Site"
- **Brave:** Click the Brave icon → "Allow popups"

### 2. **Pending Request Already Exists**
**Symptoms:** Error message "A connection request is already pending"

**Solutions:**
- Open MetaMask extension manually (click the fox icon in your browser toolbar)
- Check if there's a pending request waiting for approval
- Approve or reject the pending request
- Try connecting again

### 3. **MetaMask Not Installed**
**Symptoms:** Error "MetaMask not found"

**Solutions:**
- Install MetaMask from https://metamask.io/download/
- Restart your browser after installation
- Refresh the page

### 4. **MetaMask Locked**
**Symptoms:** Error "No accounts found" or wallet appears locked

**Solutions:**
- Click the MetaMask extension icon
- Enter your password to unlock MetaMask
- Try connecting again

### 5. **Wrong Network**
**Symptoms:** Connection works but transactions fail

**Solutions:**
- The app works on any Ethereum-compatible network
- You can manually switch networks in MetaMask if needed
- Common networks: Ethereum Mainnet, Sepolia, Goerli, etc.

### 6. **Browser Extension Conflicts**
**Symptoms:** Popup doesn't appear or wrong wallet opens

**Solutions:**
- Disable other wallet extensions (Coinbase Wallet, Phantom, etc.)
- Keep only MetaMask enabled
- Refresh the page

### 7. **Message Channel Error**
**Symptoms:** Console error: "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"

**What it means:**
- This is a known MetaMask issue related to async communication between the extension and the page
- Usually happens during network checks or provider detection

**Solutions:**
- The app has been updated to handle this error gracefully
- If you still see this error, it should not affect functionality
- The app will automatically fall back to `window.ethereum` if detection fails
- Try refreshing the page if connection fails
- Update MetaMask to the latest version

## Debugging Steps

1. **Check Browser Console:**
   - Press F12 to open Developer Tools
   - Go to Console tab
   - Look for error messages when clicking "Connect with MetaMask"
   - Share any error messages for further assistance

2. **Check MetaMask Extension:**
   - Click the MetaMask icon in your browser toolbar
   - Ensure it's unlocked
   - Check if there are any pending notifications

3. **Test MetaMask:**
   - Visit https://metamask.io/test-dapp/
   - Try connecting there to verify MetaMask is working

4. **Clear Cache:**
   - Clear browser cache and cookies
   - Restart browser
   - Try again

## Technical Details

The app uses:
- `@metamask/detect-provider` for reliable MetaMask detection
- Direct user interaction requirement (popup must be triggered by button click)
- Error handling for common MetaMask error codes:
  - `4001`: User rejected request
  - `-32002`: Request already pending
  - Popup blocker detection

### 8. **Dashboard Not Showing After MetaMask Connection**
**Symptoms:** MetaMask connects successfully but the dashboard doesn't load or redirects back to login

**What was fixed:**
- Improved localStorage synchronization after authentication
- Added proper delays to ensure session data is written before navigation
- Changed navigation to use full page reload (`window.location.href`) instead of client-side routing
- Enhanced user data hydration in dashboard fetcher
- Added better logging for debugging authentication flow

**Solutions if you still experience this:**
1. Clear browser cache and localStorage:
   - Open Developer Tools (F12)
   - Go to Application tab → Local Storage
   - Clear all entries for your site
   - Refresh and try again
2. Check browser console for any error messages
3. Ensure you're using the correct email that was registered with your wallet
4. Try signing out of MetaMask and reconnecting

## Still Having Issues?

If none of the above solutions work:

1. Check browser console for errors (F12 → Console)
2. Try a different browser
3. Update MetaMask to the latest version
4. Restart your computer
5. Report the issue with:
   - Browser name and version
   - MetaMask version
   - Console error messages
   - Steps to reproduce
