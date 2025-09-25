# PWA Install Prompt Feature

## Overview
Added a mobile-first PWA (Progressive Web App) install prompt that appears as a toast-like notification to encourage users to install the app for a better experience.

## Features

### 🎨 Toast-like Design
- Matches the visual style of your existing toaster notifications
- Smooth slide-in animation from top
- Clean, modern UI with gradient accent
- Responsive design optimized for mobile devices

### 📱 Smart Mobile Detection
- Only appears on mobile devices (using `useIsMobile` hook)
- Automatically detects if app is already installed
- Respects browser's `beforeinstallprompt` event

### ⚡ User Experience
- **Timing**: Appears 5 seconds after page load (non-intrusive)
- **Persistence**: 
  - "Not now" = dismissed for current session only
  - Can be permanently dismissed via localStorage
- **Visual Feedback**: Shows success/error toasts for install actions

### 🔧 Technical Features
- Uses native `beforeinstallprompt` API
- Handles app installation state changes
- Automatic cleanup when app gets installed
- Graceful fallback for unsupported browsers

## UI Components

### Layout
```
┌─────────────────────────────────┐
│ [📱] AI Chat App            [×] │
│     Install for better experience│  
│                                 │
│ [Install App] [Not now]         │
└─────────────────────────────────┘
```

### Styling Features
- **App Icon**: Gradient background (blue to purple) with smartphone icon
- **Typography**: Clear hierarchy with app name and description
- **Buttons**: Primary gradient button + outline secondary button  
- **Colors**: Follows your app's theme system (light/dark mode)

## Installation Triggers

1. **Automatic**: Shows 5 seconds after first visit on mobile
2. **Conditions**: 
   - Must be on mobile device
   - App not already installed  
   - User hasn't permanently dismissed
   - Browser supports PWA installation

## User Flow

1. **First Visit** → Prompt appears after 5s
2. **Install Click** → Native browser install dialog
3. **Success** → "App installed successfully!" toast
4. **Dismiss** → Hidden for current session
5. **Installed** → Never shows again (auto-detected)

## Browser Support

- ✅ Chrome/Edge (Android)
- ✅ Safari (iOS 16.4+) 
- ✅ Firefox (with manifest)
- ❌ Older browsers (gracefully ignored)

## Configuration

The prompt can be customized by modifying:
- `src/components/custom/install-app-prompt.tsx`
- Timing delay (currently 5 seconds)
- Permanent dismissal behavior
- Styling and animations

## Testing

To test the prompt:
1. Open dev tools → Application → Storage
2. Clear localStorage and sessionStorage  
3. Refresh page on mobile device
4. Wait 5 seconds for prompt to appear

Note: Some browsers require HTTPS and specific PWA criteria to show the install prompt.