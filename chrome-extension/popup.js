// Dribbble Lead Capture - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('settingsForm');
  const apiKeyInput = document.getElementById('apiKey');
  const userIdInput = document.getElementById('userId');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  const settings = await chrome.storage.sync.get(['apiKey', 'userId']);
  if (settings.apiKey) {
    apiKeyInput.value = settings.apiKey;
  }
  if (settings.userId) {
    userIdInput.value = settings.userId;
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const apiKey = apiKeyInput.value.trim();
    const userId = userIdInput.value.trim();

    if (!apiKey || !userId) {
      showStatus('Please fill in all fields', 'error');
      return;
    }

    try {
      // Save to Chrome storage
      await chrome.storage.sync.set({
        apiKey,
        userId
      });

      showStatus('Settings saved successfully! ✓', 'success');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      showStatus('Failed to save settings', 'error');
    }
  });
});

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
}
