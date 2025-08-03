# 🔧 Google Maps API Key Authorization Fix

## ❌ Current Issue: `ApiTargetBlockedMapError`

The error `This API key is not authorized to use this service or API. Places API error: ApiTargetBlockedMapError` indicates that your Google Maps API key is not properly configured for the Places API.

## 🔧 Step-by-Step Fix

### 1. **Enable Places API in Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Library**
4. Search for **"Places API"**
5. Click on **Places API**
6. Click **"Enable"** button

### 2. **Verify API Key Restrictions**

1. Go to **APIs & Services** > **Credentials**
2. Find your API key and click on it
3. Under **"API restrictions"**, ensure both are selected:
   - ✅ **Maps JavaScript API**
   - ✅ **Places API** (This is the missing one!)

### 3. **Check Application Restrictions**

Under **"Application restrictions"**, ensure your domain is allowed:

**For Local Development:**
```
http://localhost:5173/*
http://localhost:5174/*
http://localhost:5175/*
http://localhost:5176/*
http://localhost:5177/*
```

**For Production:**
```
https://tattooed-world-app.onrender.com/*
```

### 4. **Verify Billing is Enabled**

1. Go to **Billing** in Google Cloud Console
2. Ensure billing is enabled for your project
3. Places API requires billing to be enabled

### 5. **Test API Key**

You can test your API key with this curl command:

```bash
curl "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Museum%20of%20Contemporary%20Art%20Australia&inputtype=textquery&fields=formatted_address,name,rating,opening_hours,geometry&key=YOUR_API_KEY"
```

Replace `YOUR_API_KEY` with your actual API key.

## 🚀 Quick Fix Script

Run this script to help configure your API key:

```bash
./setup-google-maps-autocomplete.sh
```

## 🔍 Debugging Steps

### Check Current API Key Status

```bash
# Check if API key is set in environment
echo $VITE_GOOGLE_MAPS_API_KEY

# Or check in frontend/.env file
cat frontend/.env | grep GOOGLE_MAPS_API_KEY
```

### Test API Key in Browser Console

1. Open browser developer tools
2. Go to Console tab
3. Run this test:

```javascript
// Test if API key is loaded
console.log('API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

// Test if Google Maps is loaded
console.log('Google Maps loaded:', typeof google !== 'undefined');
console.log('Places API loaded:', typeof google?.maps?.places !== 'undefined');
```

## 🛠️ Alternative Solutions

### Option 1: Use a New API Key

If your current key has restrictions that can't be modified:

1. Create a new API key in Google Cloud Console
2. Enable only the required APIs:
   - Maps JavaScript API
   - Places API
3. Set appropriate restrictions
4. Update your `frontend/.env` file

### Option 2: Use Fallback Mode

The component will automatically fall back to a regular input field if the API key is not working:

```jsx
// The component will show this message:
"Google Maps API key not configured. Address autocomplete disabled."
```

### Option 3: Temporary Disable Restrictions

For testing purposes only (not recommended for production):

1. Go to API key settings
2. Set **Application restrictions** to **"None"**
3. Set **API restrictions** to **"Don't restrict key"**
4. Test the functionality
5. Re-enable restrictions with proper settings

## 📋 Checklist

- [ ] Places API is enabled in Google Cloud Console
- [ ] API key has Places API in restrictions
- [ ] Application restrictions include your domain
- [ ] Billing is enabled for the project
- [ ] API key is correctly set in `frontend/.env`
- [ ] Frontend server has been restarted after adding API key

## 🔒 Security Best Practices

After fixing the issue, ensure your API key is properly secured:

1. **Application Restrictions**: HTTP referrers (web sites)
2. **API Restrictions**: Only Maps JavaScript API and Places API
3. **Monitor Usage**: Set up billing alerts
4. **Regular Review**: Check API key usage monthly

## 📞 Support

If you continue to have issues:

1. Check Google Cloud Console for any error messages
2. Verify your project has billing enabled
3. Ensure you're using the correct project
4. Check if there are any quotas exceeded

## 🎯 Expected Result

After fixing the API key configuration:

- ✅ No more `ApiTargetBlockedMapError` messages
- ✅ Address autocomplete suggestions appear
- ✅ Automatic field population works
- ✅ Coordinates are extracted correctly
- ✅ No performance warnings about LoadScript reloading

The address autocomplete feature should work seamlessly once the API key is properly configured! 