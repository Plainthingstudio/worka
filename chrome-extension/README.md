# Dribbble Lead Capture Chrome Extension

This Chrome extension allows you to manually capture leads from Dribbble and automatically add them to your lead management system.

## Features

- 🎯 One-click lead capture from Dribbble profiles and messages
- 📋 Automatically extracts name, profile URL, and message content
- 🔒 Secure API key authentication
- ✨ Beautiful floating button with success animations
- 📱 Works seamlessly with Dribbble's interface

## Installation

1. **Get Your API Key and User ID**
   - Go to your Supabase project: https://supabase.com/dashboard/project/eqpsztxrnysaaoqvdqow/settings/functions
   - Copy the `DRIBBBLE_EXTENSION_API_KEY` secret value
   - Get your User ID from your app's dashboard

2. **Install the Extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `chrome-extension` folder from this project

3. **Configure the Extension**
   - Click the extension icon in your Chrome toolbar
   - Enter your API Key and User ID
   - Click "Save Settings"

## Usage

1. Visit any Dribbble profile or message page
2. You'll see a floating "Add to Leads" button in the bottom-right corner
3. Click the button to capture the lead
4. The extension will:
   - Extract the person's name from the page
   - Get their Dribbble profile URL
   - Capture any message preview or bio
   - Send it to your app via the API
5. You'll see a success notification when the lead is added
6. Check your app's Leads menu to see the new lead!

## What Data is Captured?

- **Name**: Extracted from Dribbble profile or message
- **Email**: Placeholder format (can be updated later in your app)
- **Source**: Automatically set to "Dribbble"
- **Stage**: Automatically set to "Leads"
- **Notes**: Includes Dribbble profile URL and message preview
- **Dribbble URL**: Direct link to their profile

## Security

- API key is stored securely in Chrome's sync storage
- All requests are authenticated with your API key
- Only works on Dribbble.com domains
- No data is collected or stored by the extension itself

## Troubleshooting

**Button not appearing?**
- Refresh the Dribbble page
- Make sure you're on a profile or message page

**"Could not extract lead information" error?**
- Try clicking the button on a different page (profile page works best)
- Some pages may not have extractable information

**"Please configure extension settings" error?**
- Click the extension icon and enter your API Key and User ID
- Make sure to click "Save Settings"

**"Failed to add lead" error?**
- Check that your API key is correct
- Verify you're connected to the internet
- Check the extension console for detailed errors

## Support

For issues or questions, check the Edge Function logs:
https://supabase.com/dashboard/project/eqpsztxrnysaaoqvdqow/functions/add-dribbble-lead/logs

## Icon Placeholder

The extension currently needs icons. Create or add three PNG images:
- `icons/icon16.png` (16x16)
- `icons/icon48.png` (48x48)
- `icons/icon128.png` (128x128)

You can create simple placeholder icons or design custom ones that match your brand.
