let gapi;
let auth2;

// Configuration - now managed through settings
function getConfig() {
    const saved = localStorage.getItem('bedside_config');
    if (saved) {
        return JSON.parse(saved);
    }
    
    // Default/fallback config
    return {
        CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE',
        CARE_LOG_SHEET_URL: null,
        CONTACTS_SHEET_URL: null,
        ADD_ENTRY_FORM_URL: null,
        PHOTOS_URL: null,
        IDLE_TIMEOUT: 5 // minutes
    };
}

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/people/v1/rest';
const SCOPES = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/contacts.readonly';

console.log('App.js loaded');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app');
    initializeApp();
    registerServiceWorker();
});

async function initializeApp() {
    console.log('Initializing app...');
    
    // Always setup settings button handlers
    setupSettingsButton();
    
    // Check if settings are configured
    const config = getConfig();
    if (!config.CARE_LOG_SHEET_URL) {
        console.log('No care log URL configured, showing settings first');
        showSettingsPage();
        return;
    }
    
    // For demo, skip login and go straight to main app
    showMainApp();
    loadUserContacts();
    setupIdleDetection();
    setupScreensaver();
}

function setupGoogleSignIn() {
    document.getElementById('signInButton').addEventListener('click', function() {
        // For demo purposes, simulate successful login
        // In real implementation, this would use Google OAuth
        simulateGoogleLogin();
    });
    
    // Auto-login for demo - remove this for production
    setTimeout(() => {
        simulateGoogleLogin();
    }, 1000);
}

function simulateGoogleLogin() {
    // Simulate successful login for demo
    const fakeToken = 'demo_token_' + Date.now();
    const expiry = Date.now() + (3600 * 1000); // 1 hour from now
    
    localStorage.setItem('google_access_token', fakeToken);
    localStorage.setItem('token_expiry', expiry.toString());
    
    showMainApp();
    loadUserContacts();
}

function showLoginScreen() {
    document.getElementById('loginOverlay').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('loginOverlay').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
}

async function loadUserContacts() {
    console.log('Loading user contacts and care log...');
    try {
        // Load static contacts first
        loadContactsFromSheet();
        
        // Load care log from Google Sheets
        await loadCareLogFromSheet();
        console.log('Data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function loadContactsFromSheet() {
    console.log('Loading contacts...');
    // For demo, using static data. Replace with actual sheet URL
    const demoContacts = [
        { name: 'Dr. Smith', phone: '+15551234567', type: 'tel', icon: '👨‍⚕️' },
        { name: 'Nurse Mary', phone: '+15551234568', type: 'tel', icon: '👩‍⚕️' },
        { name: 'Son John', phone: '+15551234569', type: 'tel', icon: '👨' },
        { name: 'FaceTime John', phone: 'john@example.com', type: 'facetime', icon: '📹' },
        { name: 'Daughter Sue', phone: '+15551234570', type: 'tel', icon: '👩' },
        { name: 'FaceTime Sue', phone: 'sue@example.com', type: 'facetime', icon: '📹' },
        { name: 'Front Desk', phone: '+15551234571', type: 'tel', icon: '🏥' },
        { name: 'Emergency', phone: '911', type: 'tel', icon: '🚨' }
    ];
    
    console.log('Updating contact tiles with:', demoContacts);
    updateContactTiles(demoContacts);
}

async function loadCareLogFromSheet() {
    console.log('Starting care log load...');
    const config = getConfig();
    
    if (!config.CARE_LOG_SHEET_URL) {
        document.getElementById('careLogContainer').innerHTML = '<div class="loading">No care log configured. Use settings to add one.</div>';
        return;
    }
    
    try {
        console.log('Fetching CSV from:', config.CARE_LOG_SHEET_URL);
        const careLogData = await fetchCSVData(config.CARE_LOG_SHEET_URL);
        console.log('Raw care log data:', careLogData);
        
        // Transform data to match our format (Timestamp, Event, Name columns)
        const careLogEntries = careLogData.map(row => ({
            date: formatTimestamp(row.Timestamp),
            author: row.Name || 'Unknown',
            content: row.Event || ''
        }));
        
        console.log('Transformed care log entries:', careLogEntries);
        
        // Sort by date (newest first)
        careLogEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        displayCareLog(careLogEntries);
        console.log('Care log displayed successfully');
    } catch (error) {
        console.error('Error loading care log:', error);
        document.getElementById('careLogContainer').innerHTML = '<div class="loading">Error loading care log</div>';
    }
}

function formatTimestamp(timestamp) {
    try {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        return timestamp; // Return original if parsing fails
    }
}

function updateContactTiles(contacts) {
    const grid = document.querySelector('.contacts-grid');
    grid.innerHTML = '';
    
    contacts.forEach(contact => {
        const tile = document.createElement('a');
        tile.className = 'contact-tile' + (contact.type === 'facetime' ? ' facetime' : '');
        tile.href = `${contact.type}:${contact.phone}`;
        
        if (contact.name === 'Emergency') {
            tile.style.background = 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)';
        }
        
        tile.innerHTML = `
            <div class="contact-icon">${contact.icon}</div>
            <div>${contact.name}</div>
        `;
        
        grid.appendChild(tile);
    });
}

function displayCareLog(entries) {
    const container = document.getElementById('careLogContainer');
    container.innerHTML = '';
    
    entries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'care-entry';
        entryDiv.innerHTML = `
            <div class="care-entry-header">
                <span class="care-entry-author">${entry.author}</span>
                <span class="care-entry-date">${entry.date}</span>
            </div>
            <div class="care-entry-content">${entry.content}</div>
        `;
        container.appendChild(entryDiv);
    });
}


// Function to fetch and parse CSV data (for real implementation)
async function fetchCSVData(url) {
    try {
        // Use CORS proxy for local development
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        console.log('Fetching from proxy URL:', proxyUrl);
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        let csvText = data.contents;
        console.log('Original contents:', csvText);
        
        // Check if it's a data URL with base64
        if (csvText.startsWith('data:text/csv;base64,')) {
            const base64Data = csvText.replace('data:text/csv;base64,', '');
            csvText = atob(base64Data);
            console.log('Decoded data URL base64. Content:', csvText);
        } else {
            console.log('Using content as-is');
        }
        
        const parsed = parseCSV(csvText);
        console.log('Parsed CSV data:', parsed);
        return parsed;
    } catch (error) {
        console.error('Error fetching CSV:', error);
        // Fallback to demo data if fetch fails
        return getDemoData();
    }
}

function getDemoData() {
    return [
        {
            Timestamp: '1/15/2024 14:30:00',
            Event: 'Patient had a good morning. Ate breakfast well and participated in physical therapy.',
            Name: 'Nurse Mary'
        },
        {
            Timestamp: '1/15/2024 10:15:00',
            Event: 'Routine check-up completed. Vital signs are stable. Continue current medication.',
            Name: 'Dr. Smith'
        },
        {
            Timestamp: '1/14/2024 18:45:00',
            Event: 'Visited Mom today. She was in great spirits and enjoyed the flowers I brought.',
            Name: 'Daughter Sue'
        }
    ];
}

function parseCSV(csvText) {
    console.log('Parsing CSV. First 200 chars:', csvText.substring(0, 200));
    
    const lines = csvText.split('\n');
    console.log('Split into', lines.length, 'lines');
    console.log('First line (headers):', lines[0]);
    console.log('Second line (first data):', lines[1]);
    
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('Parsed headers:', headers);
    
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            console.log(`Processing line ${i}:`, line);
            const values = line.split(',').map(v => v.trim());
            console.log('Split values:', values);
            
            const entry = {};
            headers.forEach((header, index) => {
                entry[header] = values[index] || '';
            });
            console.log('Created entry:', entry);
            data.push(entry);
        }
    }
    
    console.log('Final parsed data:', data);
    return data;
}

// Service Worker registration
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('ServiceWorker registered:', registration.scope);
            
            // Check for updates periodically
            setInterval(() => {
                registration.update();
            }, 60000); // Check every minute
            
        } catch (error) {
            console.log('ServiceWorker registration failed:', error);
        }
    }
}

// Auto-refresh functionality
function setupAutoRefresh() {
    // Check for app updates every 5 minutes
    setInterval(async () => {
        if (navigator.onLine) {
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    registration.update();
                }
            } catch (error) {
                console.log('Auto-refresh failed:', error);
            }
        }
    }, 5 * 60 * 1000);
}

// Token refresh mechanism
async function refreshTokenIfNeeded() {
    const tokenExpiry = localStorage.getItem('token_expiry');
    const currentTime = Date.now();
    
    // Refresh if token expires in the next 5 minutes
    if (tokenExpiry && (parseInt(tokenExpiry) - currentTime) < (5 * 60 * 1000)) {
        try {
            // In real implementation, use refresh token to get new access token
            await refreshGoogleToken();
        } catch (error) {
            console.log('Token refresh failed:', error);
            showLoginScreen();
        }
    }
}

async function refreshGoogleToken() {
    // Placeholder for actual token refresh logic
    // This would use the refresh token to get a new access token
    console.log('Refreshing Google token...');
    
    // Simulate successful refresh
    const newExpiry = Date.now() + (3600 * 1000);
    localStorage.setItem('token_expiry', newExpiry.toString());
}

// Setup periodic token refresh
setInterval(refreshTokenIfNeeded, 60000); // Check every minute

// Initialize auto-refresh
setupAutoRefresh();

// Settings page functionality
function showSettingsPage() {
    const settingsPage = document.getElementById('settingsPage');
    settingsPage.classList.remove('hidden');
    settingsPage.style.display = 'flex'; // Force show with inline style
    
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginOverlay').classList.add('hidden');
    
    // Load current settings into form
    const config = getConfig();
    document.getElementById('careLogUrl').value = config.CARE_LOG_SHEET_URL || '';
    document.getElementById('contactsUrl').value = config.CONTACTS_SHEET_URL || '';
    document.getElementById('photosUrl').value = config.PHOTOS_URL || '';
    document.getElementById('idleTimeout').value = config.IDLE_TIMEOUT || '5';
}

function hideSettingsPage() {
    console.log('hideSettingsPage called');
    const settingsPage = document.getElementById('settingsPage');
    const mainApp = document.getElementById('mainApp');
    
    console.log('Settings page element:', settingsPage);
    console.log('Main app element:', mainApp);
    
    if (settingsPage) {
        settingsPage.classList.add('hidden');
        settingsPage.style.display = 'none'; // Force hide with inline style
        console.log('Added hidden class to settings page');
        console.log('Settings page classes after hiding:', settingsPage.className);
        console.log('Settings page style.display:', settingsPage.style.display);
    }
    
    if (mainApp) {
        mainApp.classList.remove('hidden');
        console.log('Removed hidden class from main app');
        
        // Load contacts even without care log URL configured
        loadContactsFromSheet();
    }
}

function setupSettingsButton() {
    console.log('Setting up settings button handlers');
    
    // Test screensaver button
    const testBtn = document.getElementById('testScreensaverBtn');
    if (testBtn) {
        testBtn.addEventListener('click', function() {
            console.log('Manual screensaver trigger');
            enterScreensaver();
        });
        console.log('Test screensaver button handler added');
    }
    
    // Main settings button (might not exist on first load)
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettingsPage);
        console.log('Settings button handler added');
    }
    
    // Close button
    const closeBtn = document.getElementById('closeSettingsBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            console.log('Close button clicked');
            hideSettingsPage();
        });
        console.log('Close button handler added');
    } else {
        console.error('Close button not found!');
    }
    
    document.getElementById('saveSettingsBtn').addEventListener('click', function() {
        console.log('Save settings button clicked');
        const careLogUrl = document.getElementById('careLogUrl').value.trim();
        const contactsUrl = document.getElementById('contactsUrl').value.trim();
        
        console.log('Care log URL:', careLogUrl);
        console.log('Contacts URL:', contactsUrl);
        
        if (!careLogUrl) {
            alert('Care Log CSV URL is required');
            return;
        }
        
        const photosUrl = document.getElementById('photosUrl').value.trim();
        const idleTimeout = document.getElementById('idleTimeout').value;
        
        const config = getConfig();
        config.CARE_LOG_SHEET_URL = careLogUrl;
        config.CONTACTS_SHEET_URL = contactsUrl || null;
        config.PHOTOS_URL = photosUrl || null;
        config.IDLE_TIMEOUT = parseInt(idleTimeout);
        
        console.log('Saving config:', config);
        localStorage.setItem('bedside_config', JSON.stringify(config));
        
        alert('Settings saved! Reloading app...');
        location.reload();
    });
    
    document.getElementById('clearSettingsBtn').addEventListener('click', function() {
        if (confirm('Clear all settings? This cannot be undone.')) {
            localStorage.removeItem('bedside_config');
            document.getElementById('careLogUrl').value = '';
            document.getElementById('contactsUrl').value = '';
            document.getElementById('photosUrl').value = '';
            document.getElementById('idleTimeout').value = '5';
            alert('Settings cleared');
        }
    });
}

// Handle app visibility changes (when user returns to app)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        refreshTokenIfNeeded();
    }
});

// PWA install prompt handling
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Could show custom install button here
    console.log('PWA install prompt available');
});

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
});

// Idle detection and screensaver functionality
let idleTimer = null;
let lastActivity = Date.now();
let screensaverActive = false;
let photoRotationTimer = null;
let currentPhotoIndex = 0;
let photoUrls = [];
let idleDetectionPaused = false;

function setupIdleDetection() {
    const config = getConfig();
    const timeout = config.IDLE_TIMEOUT || 5; // Default to 5 minutes if undefined
    
    if (timeout === 0) return; // Disabled
    
    console.log('Setting up idle detection with timeout:', timeout, 'minutes');
    
    // Clear any existing timer first
    if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
    }
    
    const timeoutMs = timeout * 60 * 1000;
    
    // Reset idle timer on any activity
    const resetIdleTimer = () => {
        lastActivity = Date.now();
        
        // Don't do anything if idle detection is paused or screensaver is active
        if (idleDetectionPaused || screensaverActive) {
            return;
        }
        
        if (idleTimer) {
            clearTimeout(idleTimer);
        }
        
        idleTimer = setTimeout(() => {
            if (!screensaverActive && !idleDetectionPaused) { // Double-check before entering
                console.log('Idle timeout triggered, entering screensaver');
                enterScreensaver();
            } else {
                console.log('Idle timeout triggered but screensaver blocked:', {screensaverActive, idleDetectionPaused});
            }
        }, timeoutMs);
        
        console.log('Idle timer set for', timeoutMs, 'ms from now');
    };
    
    // Activity events - only add if not already added
    if (!window.idleDetectionSetup) {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, resetIdleTimer, true);
        });
        window.idleDetectionSetup = true;
    }
    
    // Start the timer with current timestamp
    lastActivity = Date.now();
    resetIdleTimer();
}

function setupScreensaver() {
    const screensaverPage = document.getElementById('screensaverPage');
    screensaverPage.addEventListener('click', exitScreensaver);
}

function enterScreensaver() {
    console.log('Entering screensaver mode');
    screensaverActive = true;
    
    // Reset UI state
    hideSettingsPage();
    document.getElementById('loginOverlay').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    
    // Show screensaver
    const screensaverPage = document.getElementById('screensaverPage');
    screensaverPage.classList.remove('hidden');
    screensaverPage.style.display = 'flex';
    
    // Load and start photo rotation
    loadPhotosForScreensaver();
}

function exitScreensaver() {
    console.log('Exiting screensaver mode');
    screensaverActive = false;
    
    // Hide screensaver
    const screensaverPage = document.getElementById('screensaverPage');
    screensaverPage.classList.add('hidden');
    screensaverPage.style.display = 'none';
    
    // Show main app
    showMainApp();
    loadUserContacts();
}

function loadPhotosForScreensaver() {
    const config = getConfig();
    
    if (!config.PHOTOS_URL) {
        // Show default/placeholder images with proper SVG encoding
        photoUrls = [
            'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
                <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="#667eea"/>
                    <text x="50%" y="50%" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dy=".3em">Welcome</text>
                </svg>
            `)
        ];
        startPhotoRotation();
        return;
    }
    
    // For Google Photos, we'd need to parse the shared album
    // For now, use placeholder until we implement photo parsing
    photoUrls = [
        'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#667eea"/>
                <text x="50%" y="50%" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dy=".3em">Family Photos</text>
            </svg>
        `)
    ];
    
    startPhotoRotation();
}

function startPhotoRotation() {
    if (photoUrls.length === 0) return;
    
    currentPhotoIndex = 0;
    showCurrentPhoto();
    
    // Rotate photos every 10 seconds
    photoRotationTimer = setInterval(() => {
        currentPhotoIndex = (currentPhotoIndex + 1) % photoUrls.length;
        showCurrentPhoto();
    }, 10000);
}

function showCurrentPhoto() {
    const img = document.getElementById('screensaverImage');
    const caption = document.querySelector('.photo-caption');
    
    img.style.opacity = '0';
    
    // Add error handler for broken images
    img.onerror = function() {
        console.log('Image failed to load, hiding img element');
        img.style.display = 'none';
        caption.textContent = 'Touch anywhere to continue';
    };
    
    img.onload = function() {
        console.log('Image loaded successfully');
        img.style.display = 'block';
        img.style.opacity = '1';
    };
    
    setTimeout(() => {
        console.log('Setting image src to:', photoUrls[currentPhotoIndex]);
        img.src = photoUrls[currentPhotoIndex];
        caption.textContent = `Photo ${currentPhotoIndex + 1} of ${photoUrls.length}`;
    }, 500);
}

// Handle contact tile taps with haptic feedback (iOS)
document.addEventListener('DOMContentLoaded', function() {
    // Delay to ensure tiles are created
    setTimeout(() => {
        document.querySelectorAll('.contact-tile').forEach(tile => {
            tile.addEventListener('touchstart', function() {
                // Add haptic feedback if available
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
            });
        });
    }, 1000);
});

// Error handling for offline scenarios
window.addEventListener('online', function() {
    console.log('App is online');
    refreshTokenIfNeeded();
});

window.addEventListener('offline', function() {
    console.log('App is offline');
    // Could show offline indicator
});