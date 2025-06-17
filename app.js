let gapi;
let auth2;

// Configuration - replace with your actual Google Sheets/Forms
const CONFIG = {
    CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE',
    CARE_LOG_SHEET_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSsRgbq8lUi6qWSldir_27avmx_h-VQ2iNRvPn-ZdTaGdoA2c4hrFlJLjtLLdsHsi1G52pus95s19kY/pub?output=csv',
    CONTACTS_SHEET_URL: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=1',
    ADD_ENTRY_FORM_URL: 'https://docs.google.com/forms/d/YOUR_FORM_ID/viewform'
};

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
    
    // For demo, skip login and go straight to main app
    showMainApp();
    loadUserContacts();
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
    try {
        console.log('Fetching CSV from:', CONFIG.CARE_LOG_SHEET_URL);
        const careLogData = await fetchCSVData(CONFIG.CARE_LOG_SHEET_URL);
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
        const csvText = data.contents;
        console.log('Raw CSV text received:', csvText);
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
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',');
            const entry = {};
            headers.forEach((header, index) => {
                entry[header.trim()] = values[index]?.trim() || '';
            });
            data.push(entry);
        }
    }
    
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

// Handle contact tile taps with haptic feedback (iOS)
document.querySelectorAll('.contact-tile').forEach(tile => {
    tile.addEventListener('touchstart', function() {
        // Add haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    });
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