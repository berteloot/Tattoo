# 🔧 Geocoding Fix Guide

## ❌ Current Issue
The geocoding service is returning Montreal center coordinates (45.5017, -73.5673) for all addresses, indicating the Google Geocoding API key is not working properly.

## 🔍 Diagnosis Results
- ✅ Geocoding service is running
- ✅ Cache system is working
- ❌ API key is invalid or misconfigured
- ❌ All addresses return fallback coordinates

## 🔧 Step-by-Step Fix

### 1. **Check Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Library**
4. Search for **"Geocoding API"**
5. **Enable** the Geocoding API if not already enabled

### 2. **Verify API Key Configuration**

1. Go to **APIs & Services** > **Credentials**
2. Find your API key and click on it
3. Check these settings:

#### **API Restrictions:**
- ✅ **Geocoding API** should be enabled
- ✅ **Maps JavaScript API** should be enabled (for frontend)

#### **Application Restrictions:**
- **For Server Key (Backend):**
  - Set to "IP addresses"
  - Add your Render.com server IP (or leave unrestricted for testing)
- **For Browser Key (Frontend):**
  - Set to "HTTP referrers"
  - Add: `https://tattooed-world-backend.onrender.com/*`

### 3. **Check Billing**

1. Go to **Billing** in Google Cloud Console
2. Ensure billing is enabled for your project
3. Geocoding API requires billing to be enabled

### 4. **Update Render.com Environment Variables**

1. Go to your Render.com dashboard
2. Select your service
3. Go to **Environment** tab
4. Check these variables:

```bash
GOOGLE_GEOCODE_API_KEY=your_server_key_here
VITE_GOOGLE_MAPS_API_KEY=your_browser_key_here
```

5. **Make sure the keys match** your Google Cloud Console keys
6. **Redeploy** your service after updating environment variables

### 5. **Test the Fix**

Run the diagnosis script:
```bash
node fix-geocoding-api-key.js
```

**Expected Output (Success):**
```
✅ Using real coordinates!
✅ Got specific coordinates!
✅ GOOD NEWS: API key is working!
```

**Expected Output (Still Broken):**
```
⚠️ Using Montreal center coordinates (fallback)
❌ ISSUE: API key is not working properly
```

### 6. **Run Background Processing**

Once the API key is working, run the background processor:
```bash
node run-background-geocoding.js
```

This will:
- Process all studios in small batches (5 at a time)
- Geocode addresses with postal codes
- Update studio coordinates in database
- Handle errors gracefully
- Provide detailed progress updates

## 🎯 Expected Results

After fixing the API key and running the background processor:

1. **Map Display:** Studios will appear at their actual locations
2. **No Overlapping:** Each studio will have unique coordinates
3. **Accurate Locations:** Based on postal codes and full addresses
4. **Performance:** Cached results for faster future access

## 🔍 Troubleshooting

### **If API key still doesn't work:**

1. **Create a new API key:**
   - Go to Google Cloud Console > Credentials
   - Click "Create Credentials" > "API Key"
   - Configure restrictions properly
   - Update in Render.com

2. **Check API quotas:**
   - Go to Google Cloud Console > APIs & Services > Quotas
   - Ensure you haven't exceeded daily limits

3. **Test with curl:**
   ```bash
   curl "https://maps.googleapis.com/maps/api/geocode/json?address=1541%20Sherbrooke%20St%20W,%20Montreal,%20Quebec%20H3G%201L1&key=YOUR_API_KEY"
   ```

### **If background processing fails:**

1. **Check network connectivity**
2. **Verify studio data has postal codes**
3. **Check Render.com logs for errors**
4. **Run in smaller batches if needed**

## 📊 Monitoring

After successful processing, you can:

1. **Check cache stats:**
   ```bash
   curl https://tattooed-world-backend.onrender.com/api/geocoding/cache-stats
   ```

2. **View the map:**
   - Visit: https://tattooed-world-backend.onrender.com/map
   - Studios should appear at actual locations

3. **Check individual studios:**
   - Visit studio detail pages
   - Location icons should link to map with correct coordinates

## 🚀 Quick Commands

```bash
# Test API key
node fix-geocoding-api-key.js

# Run background processing
node run-background-geocoding.js

# Check cache stats
curl https://tattooed-world-backend.onrender.com/api/geocoding/cache-stats

# Clear cache (if needed)
curl -X POST https://tattooed-world-backend.onrender.com/api/geocoding/clear-cache
```

## 💡 Pro Tips

1. **Start with unrestricted API key** for testing, then add restrictions
2. **Use separate keys** for frontend and backend
3. **Monitor usage** in Google Cloud Console
4. **Cache results** to reduce API calls and costs
5. **Process in batches** to avoid rate limits

## 🆘 Need Help?

If you're still having issues:

1. **Check Render.com logs** for detailed error messages
2. **Verify all environment variables** are set correctly
3. **Test API key directly** in Google Cloud Console
4. **Ensure billing is enabled** for your Google Cloud project 