# Google Maps API Setup Guide

## Overview
This app uses Google Maps API for geocoding addresses and displaying maps. You need to set up two API keys:

1. **Browser Key** - For frontend map display (restricted by domain)
2. **Server Key** - For backend geocoding (restricted by IP)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for API usage)

## Step 2: Enable APIs

Enable these APIs in your Google Cloud project:

1. **Maps JavaScript API** - For frontend map display
2. **Geocoding API** - For converting addresses to coordinates

## Step 3: Create API Keys

### Browser Key (Frontend)
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Name it "Browser Key - Tattoo App"
4. **Restrict by HTTP referrer:**
   - Add: `https://tattooed-world-backend.onrender.com/*`
   - Add: `http://localhost:5173/*` (for development)
5. **Restrict APIs:**
   - Select "Maps JavaScript API" only

### Server Key (Backend)
1. Create another API key
2. Name it "Server Key - Tattoo App"
3. **Restrict by IP address:**
   - Add your server IP (or leave unrestricted for Render.com)
4. **Restrict APIs:**
   - Select "Geocoding API" only

## Step 4: Environment Variables

### Frontend (.env)
```bash
VITE_GOOGLE_MAPS_API_KEY=your_browser_key_here
```

### Backend (.env)
```bash
GOOGLE_GEOCODE_API_KEY=your_server_key_here
```

### Render.com Environment Variables
Add these in your Render dashboard:

1. `GOOGLE_GEOCODE_API_KEY` = your server key
2. `VITE_GOOGLE_MAPS_API_KEY` = your browser key

## Step 5: Test the Setup

1. **Test Geocoding:**
   ```bash
   node test-geocoding.js
   ```

2. **Update Existing Studios:**
   ```bash
   node update-studios-with-geocoding.js
   ```

3. **Check the Map:**
   - Visit: https://tattooed-world-backend.onrender.com/map

## Security Best Practices

1. **Never expose server keys in frontend code**
2. **Use domain restrictions for browser keys**
3. **Use IP restrictions for server keys**
4. **Monitor API usage in Google Cloud Console**
5. **Set up billing alerts**

## Cost Considerations

- **Maps JavaScript API**: $7 per 1000 map loads
- **Geocoding API**: $5 per 1000 requests
- **Free tier**: $200 credit per month

## Troubleshooting

### "API key not valid" error
- Check if API is enabled
- Verify key restrictions
- Ensure billing is enabled

### "Quota exceeded" error
- Check usage in Google Cloud Console
- Implement caching (already done)
- Consider upgrading billing plan

### Map not loading
- Check browser key restrictions
- Verify domain is allowed
- Check browser console for errors

### Geocoding not working
- Check server key restrictions
- Verify Geocoding API is enabled
- Check backend logs for errors 