# BedsideApp - Claude Context

## Project Overview

A full-screen, iPad-friendly web application designed specifically for nursing home residents with cognitive and motor limitations. The app provides an accessible interface for communication and care coordination through large, touch-optimized contact tiles and integrated care logging.

## Target User & Context

- **Primary User**: Nursing home resident with cognitive/motor limitations
- **Environment**: Bedside iPad, likely used by multiple family members and caregivers
- **Usage Pattern**: Touch-based interaction, launched from home screen as PWA
- **Accessibility Needs**: Large fonts, high contrast, minimal cognitive load, no scrolling

## Core Features

### Contact System
- Large tappable photo tiles for key contacts
- Direct calling via `tel:` links
- Video calling via `facetime:` links  
- Emergency contact (911) prominently displayed
- Color-coded tiles (blue for phone, purple for FaceTime, red for emergency)

### Care Log Integration
- Embeds Google Sheets as care log via CSV URL
- Allows family members to add notes and track care
- Modal interface to avoid navigation complexity

### Progressive Web App (PWA)
- Offline capability via service worker
- "Add to Home Screen" functionality
- Full-screen app experience on iOS

## Design Decisions

### Accessibility-First Design
- **High Contrast**: Solid colors instead of gradients for better visibility
- **Large Touch Targets**: Minimum 120px height tiles with generous spacing
- **Simple Typography**: Large, bold fonts throughout
- **No Scrolling**: Everything fits on screen to avoid confusion
- **Minimal UI**: Hidden hamburger menu to reduce visual clutter

### Technology Choices
- **Vanilla HTML/CSS/JS**: No framework dependencies for simplicity and reliability
- **Tailwind CSS via CDN**: Rapid styling without build process
- **Service Worker**: Enables offline functionality and PWA features
- **Google Sheets Integration**: Familiar tool for family members, no complex backend

### Layout Strategy
- **Grid System**: 2x4 contact grid fills entire screen efficiently
- **Full-Screen Modal**: Care log opens as overlay to maintain context
- **Fixed Positioning**: Menu and controls positioned to avoid accidental activation

### User Flow Simplification
- **Single Screen**: Main interface shows all contacts at once
- **Direct Actions**: Tapping contacts immediately initiates calls
- **Hidden Complexity**: Settings and care log accessible but not prominent
- **Screensaver Mode**: Idle timeout shows welcoming message

## Configuration & Customization

### Dynamic Contact Loading
- Supports CSV import for contacts from Google Sheets
- Falls back to hardcoded contacts if no CSV provided
- Allows customization without code changes

### Settings Management
- Care log CSV URL configuration
- Optional contacts CSV override
- Google Photos integration for screensaver
- Configurable idle timeout

## Deployment & Distribution

### GitHub Pages Ready
- Static files in root directory
- No build process required
- PWA features work on GitHub Pages
- Direct deployment from main branch

### Installation Process
1. Access via web browser on iPad
2. Use "Add to Home Screen" in Safari
3. App launches full-screen like native app
4. Configure URLs in settings as needed

## Development Commands

**Testing**: Open `index.html` in browser (no server required)
**Linting**: No specific linting setup (vanilla HTML/CSS/JS)
**Build**: No build process needed
**Deploy**: Push to main branch, enable GitHub Pages

## File Structure

- `index.html` - Main application interface
- `app.js` - Application logic and interactions
- `sw.js` - Service worker for PWA functionality
- `manifest.json` - PWA manifest configuration
- `icon-192.png/svg` - App icons for home screen
- `CSV_FORMATS.md` - Documentation for CSV data structure

## Development Guidelines

- Any time you change a csv format you must update the CSV_FORMATS.md file

## Future Considerations

- **Photo Integration**: Screensaver can display family photos from Google Photos