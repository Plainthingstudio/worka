// Dribbble Lead Capture - Content Script

console.log('Dribbble Lead Capture extension loaded');

// Create floating "Add to Leads" button
function createAddLeadButton() {
  // Remove existing button if any
  const existingButton = document.getElementById('dribbble-lead-capture-btn');
  if (existingButton) {
    existingButton.remove();
  }

  const button = document.createElement('button');
  button.id = 'dribbble-lead-capture-btn';
  button.className = 'dribbble-lead-capture-button';
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <line x1="19" y1="8" x2="19" y2="14"></line>
      <line x1="22" y1="11" x2="16" y2="11"></line>
    </svg>
    <span>Add to Leads</span>
  `;

  button.addEventListener('click', handleAddLead);
  document.body.appendChild(button);
}

// Extract lead data from the current page
function extractLeadData() {
  const leadData = {
    name: '',
    email: '',
    dribbble_url: window.location.href,
    message_preview: ''
  };

  // Try to extract name from different page types with comprehensive selectors
  const nameSelectors = [
    'h1', // Most common heading
    '[class*="profile"] h1',
    '[class*="profile"] h2',
    '.profile-name',
    '.profile-header h1',
    '[class*="ProfileHeader"] h1',
    '[class*="UserInfo"] h1',
    'header h1',
    '[data-testid*="profile"] h1',
    '[data-testid*="name"]',
    '.author-name',
    '.message-sender',
    '[class*="message"] [class*="author"]',
    '.shot-byline-user a',
    '[class*="shot"] [class*="author"] a',
    'main h1'
  ];

  for (const selector of nameSelectors) {
    try {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        const text = element.textContent.trim();
        // Filter out common non-name text
        if (text && !text.toLowerCase().includes('dribbble') && text.length < 100) {
          leadData.name = text;
          break;
        }
      }
    } catch (e) {
      console.log('Selector failed:', selector, e);
    }
  }

  // Try to find email (usually not publicly visible on Dribbble)
  const emailElement = document.querySelector('[href^="mailto:"]');
  if (emailElement) {
    leadData.email = emailElement.href.replace('mailto:', '');
  }

  // Extract message content if on message page
  const messageContent = document.querySelector('.message-body, [class*="message-content"], [class*="conversation"] p');
  if (messageContent) {
    leadData.message_preview = messageContent.textContent.trim().substring(0, 200);
  }

  // Extract bio/description
  const bioElement = document.querySelector('.bio, [class*="biography"], [class*="description"]');
  if (bioElement && !leadData.message_preview) {
    leadData.message_preview = bioElement.textContent.trim().substring(0, 200);
  }

  return leadData;
}

// Handle add lead button click
async function handleAddLead() {
  const button = document.getElementById('dribbble-lead-capture-btn');
  
  // Show loading state
  button.classList.add('loading');
  button.innerHTML = `
    <div class="spinner"></div>
    <span>Adding...</span>
  `;
  button.disabled = true;

  try {
    // Get settings from storage
    const settings = await chrome.storage.sync.get(['apiKey', 'userId']);
    
    if (!settings.apiKey || !settings.userId) {
      showNotification('Please configure the extension settings first', 'error');
      button.classList.remove('loading');
      button.disabled = false;
      resetButton(button);
      return;
    }

    // Extract lead data
    const leadData = extractLeadData();
    
    if (!leadData.name) {
      showNotification('Could not extract lead information from this page', 'error');
      button.classList.remove('loading');
      button.disabled = false;
      resetButton(button);
      return;
    }

    // Add user_id to lead data
    leadData.user_id = settings.userId;

    console.log('Sending lead data:', leadData);

    // Send to API
    const response = await fetch('https://eqpsztxrnysaaoqvdqow.supabase.co/functions/v1/add-dribbble-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey
      },
      body: JSON.stringify(leadData)
    });

  const result = await response.json();

  if (response.ok && result.success) {
    showNotification('Lead added successfully! ✓', 'success');
    
    // Success animation
    button.classList.add('success');
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Added!</span>
    `;
    
    setTimeout(() => {
      resetButton(button);
      button.classList.remove('success', 'loading');
      button.disabled = false;
    }, 2000);
  } else {
    if (response.status === 401 || (result && result.error === 'Unauthorized')) {
      showNotification('Unauthorized: Check your API key in the extension settings.', 'error');
    } else {
      showNotification('Failed to add lead: ' + (result.error || 'Unknown error'), 'error');
    }
    throw new Error(result.error || 'Failed to add lead');
  }
  } catch (error) {
    console.error('Error adding lead:', error);
    showNotification('Failed to add lead: ' + error.message, 'error');
    button.classList.remove('loading');
    button.disabled = false;
    resetButton(button);
  }
}

// Reset button to default state
function resetButton(button) {
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <line x1="19" y1="8" x2="19" y2="14"></line>
      <line x1="22" y1="11" x2="16" y2="11"></line>
    </svg>
    <span>Add to Leads</span>
  `;
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `dribbble-lead-notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Initialize extension when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createAddLeadButton);
} else {
  createAddLeadButton();
}

// Re-create button when navigating (for single-page app behavior)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(createAddLeadButton, 1000);
  }
}).observe(document, { subtree: true, childList: true });
