# PostgreSQL HTTP Foreign Data Wrapper Geocoding System

## 🚀 Overview

This is a **radically different approach** to geocoding studio addresses that moves all geocoding logic directly into PostgreSQL using HTTP foreign data wrappers. This eliminates the need for external ETL processes, application-side loops, and complex caching systems.

## ✨ Key Benefits

- **No External ETL**: Geocoding happens directly in SQL queries
- **Real-time Updates**: Always get the latest geocoding results
- **PostGIS Integration**: Full spatial database capabilities
- **GeoJSON Output**: Native GeoJSON generation for maps
- **Rate Limiting**: Built-in PostgreSQL rate limiting
- **Caching**: Automatic caching in the database
- **Spatial Indexing**: Fast spatial queries with PostGIS

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   PostgreSQL     │    │  Google Maps    │
│   React App     │◄──►│   Database       │◄──►│   Geocoding API │
│                 │    │                  │    │                 │
│ - StudioMap     │    │ - HTTP Foreign   │    │ - Geocoding     │
│ - API Calls     │    │   Data Wrapper   │    │ - Rate Limits   │
│ - GeoJSON       │    │ - PostGIS        │    │ - API Keys      │
└─────────────────┘    │ - Functions      │    └─────────────────┘
                       │ - Views          │
                       └──────────────────┘
```

## 📋 Prerequisites

### 1. PostgreSQL Extensions

You need these PostgreSQL extensions installed:

```sql
-- Install PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Install HTTP foreign data wrapper
CREATE EXTENSION IF NOT EXISTS http_fdw;
```

### 2. Google Maps API Key

Set up a Google Maps API key with Geocoding API enabled.

## 🛠️ Setup Instructions

### Step 1: Run the Setup Script

```bash
# Navigate to backend directory
cd backend

# Run the PostgreSQL setup
node scripts/setup-postgres-geocoding.js setup
```

### Step 2: Set API Key

```bash
# Set the Google Maps API key
export GOOGLE_MAPS_API_KEY="your-api-key-here"

# Or set it in PostgreSQL directly
psql -d your_database -c "SELECT set_google_maps_api_key('your-api-key-here');"
```

### Step 3: Test the System

```bash
# Test the geocoding system
node scripts/setup-postgres-geocoding.js test

# Check geocoding status
node scripts/setup-postgres-geocoding.js status

# Batch geocode all studios
node scripts/setup-postgres-geocoding.js batch
```

## 🗄️ Database Functions

### Core Functions

#### `geocode_address(address, city, state, zipcode, country)`
Geocodes a single address using Google Maps API.

```sql
SELECT geocode_address(
  '123 Main St',
  'New York',
  'NY',
  '10001',
  'United States'
) as result;
```

**Returns:**
```json
{
  "status": "OK",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "formatted_address": "123 Main St, New York, NY 10001, USA",
  "full_address": "123 Main St, New York, NY 10001, United States"
}
```

#### `update_studio_coordinates(studio_id)`
Updates a studio's coordinates using geocoding.

```sql
SELECT update_studio_coordinates('studio-id-here') as result;
```

#### `batch_update_studio_coordinates()`
Batch geocodes all studios without coordinates.

```sql
SELECT * FROM batch_update_studio_coordinates();
```

#### `get_studios_geojson(lat_min, lat_max, lng_min, lng_max)`
Returns GeoJSON for map display.

```sql
SELECT get_studios_geojson() as geojson;
```

### Views

#### `studio_locations`
A view that combines studio data with geocoding results.

```sql
SELECT * FROM studio_locations LIMIT 10;
```

## 🗺️ API Endpoints

### GET `/api/geocoding/studios`
Get all studios with geocoding as GeoJSON.

**Query Parameters:**
- `lat_min`, `lat_max`, `lng_min`, `lng_max`: Bounding box filter
- `limit`: Maximum number of results

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [-74.0060, 40.7128]
        },
        "properties": {
          "id": "studio-id",
          "name": "Studio Name",
          "address": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zip_code": "10001",
          "country": "United States",
          "is_verified": true,
          "is_featured": false,
          "full_address": "123 Main St, New York, NY 10001, United States"
        }
      }
    ]
  },
  "count": 1
}
```

### GET `/api/geocoding/status`
Get geocoding status statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_studios": 100,
    "geocoded_studios": 85,
    "missing_coordinates": 15,
    "percentage_complete": 85.00
  }
}
```

### POST `/api/geocoding/geocode`
Geocode a single address.

**Request Body:**
```json
{
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipcode": "10001",
  "country": "United States"
}
```

### PUT `/api/geocoding/studios/:id/geocode`
Update a specific studio's coordinates.

### GET `/api/geocoding/studio-locations`
Get raw studio location data.

## 🎨 Frontend Integration

### Using the StudioMapPostgres Component

```jsx
import StudioMapPostgres from './components/StudioMapPostgres';

function StudiosPage() {
  return (
    <div>
      <h1>Studio Map</h1>
      <StudioMapPostgres
        center={{ lat: 40.7128, lng: -74.0060 }}
        zoom={10}
        height="600px"
        showInfoWindows={true}
        onStudioClick={(studio) => {
          console.log('Studio clicked:', studio);
        }}
      />
    </div>
  );
}
```

### Component Props

- `center`: Map center coordinates `{lat, lng}`
- `zoom`: Initial zoom level
- `height`: Map container height
- `showInfoWindows`: Show info windows on marker click
- `onStudioClick`: Callback when studio marker is clicked

## 🔧 Advanced Usage

### Spatial Queries

```sql
-- Find studios within 10km of a point
SELECT * FROM studio_locations
WHERE ST_DWithin(
  geom,
  ST_SetSRID(ST_MakePoint(-74.0060, 40.7128), 4326),
  10000
);

-- Find studios in a specific area
SELECT * FROM studio_locations
WHERE ST_Within(
  geom,
  ST_MakeEnvelope(-74.1, 40.7, -73.9, 40.8, 4326)
);
```

### Custom Geocoding Functions

```sql
-- Geocode with custom parameters
CREATE OR REPLACE FUNCTION geocode_with_region(
  p_address TEXT,
  p_region TEXT DEFAULT 'US'
) RETURNS JSONB AS $$
BEGIN
  -- Add region bias to geocoding
  RETURN geocode_address(p_address) || jsonb_build_object('region', p_region);
END;
$$ LANGUAGE plpgsql;
```

### Rate Limiting

The system includes built-in rate limiting:

```sql
-- Set custom rate limiting delay
CREATE OR REPLACE FUNCTION batch_update_studio_coordinates_custom(
  p_delay_seconds INTEGER DEFAULT 2
) RETURNS TABLE(...) AS $$
BEGIN
  -- Custom implementation with configurable delay
END;
$$ LANGUAGE plpgsql;
```

## 🚨 Error Handling

### Common Errors

1. **API Key Not Set**
   ```
   ERROR: Google Maps API key not configured. Set app.google_maps_api_key
   ```
   **Solution:** Set the API key using `set_google_maps_api_key()`

2. **Rate Limit Exceeded**
   ```
   {"status": "OVER_QUERY_LIMIT", "error": "Rate limit exceeded"}
   ```
   **Solution:** Wait and retry, or increase delay in batch functions

3. **Invalid Address**
   ```
   {"status": "ZERO_RESULTS", "error": "No results found"}
   ```
   **Solution:** Check address format and try with more specific details

### Error Recovery

```sql
-- Retry failed geocoding
UPDATE studios 
SET latitude = NULL, longitude = NULL 
WHERE latitude IS NULL OR longitude IS NULL;

-- Then run batch geocoding again
SELECT * FROM batch_update_studio_coordinates();
```

## 📊 Monitoring and Maintenance

### Check Geocoding Status

```sql
-- Get current status
SELECT * FROM get_geocoding_status();

-- Check for failed geocoding
SELECT id, title, address, city, state, zip_code, country
FROM studios
WHERE (latitude IS NULL OR longitude IS NULL)
  AND is_active = true
  AND address IS NOT NULL;
```

### Performance Optimization

```sql
-- Create spatial index for better performance
CREATE INDEX idx_studios_geom_spatial 
ON studios USING GIST(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

-- Create index on address fields
CREATE INDEX idx_studios_address 
ON studios(address, city, state, zip_code, country);
```

### Backup and Recovery

```sql
-- Backup geocoding results
CREATE TABLE studios_geocoding_backup AS
SELECT id, latitude, longitude, updated_at
FROM studios
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Restore from backup
UPDATE studios s
SET 
  latitude = b.latitude,
  longitude = b.longitude,
  updated_at = b.updated_at
FROM studios_geocoding_backup b
WHERE s.id = b.id;
```

## 🔒 Security Considerations

1. **API Key Protection**: Store API keys securely and rotate regularly
2. **Rate Limiting**: Respect Google Maps API rate limits
3. **Input Validation**: Validate addresses before geocoding
4. **Error Logging**: Log geocoding errors for monitoring

## 🎯 Best Practices

1. **Batch Processing**: Use batch functions for large datasets
2. **Caching**: Leverage database caching for repeated addresses
3. **Error Handling**: Implement proper error handling and retry logic
4. **Monitoring**: Monitor geocoding success rates and API usage
5. **Testing**: Test with various address formats and edge cases

## 🚀 Deployment

### Production Setup

1. **Install Extensions**: Ensure PostGIS and http_fdw are installed
2. **Set API Key**: Configure Google Maps API key in production
3. **Run Setup**: Execute the setup script
4. **Test**: Verify geocoding works correctly
5. **Monitor**: Set up monitoring for geocoding success rates

### Environment Variables

```bash
# Required
GOOGLE_MAPS_API_KEY=your-api-key-here

# Optional
POSTGRES_EXTENSIONS=postgis,http_fdw
GEOCODING_RATE_LIMIT_DELAY=1
```

## 📈 Performance Metrics

- **Geocoding Success Rate**: Target >95%
- **Average Response Time**: <2 seconds per address
- **Batch Processing Speed**: ~50 addresses per minute (with rate limiting)
- **Spatial Query Performance**: <100ms for bounding box queries

## 🔄 Migration from Old System

If migrating from the old geocoding system:

1. **Backup**: Backup existing coordinates
2. **Setup**: Install new PostgreSQL system
3. **Migrate**: Run batch geocoding for missing coordinates
4. **Verify**: Compare results with old system
5. **Switch**: Update frontend to use new API endpoints

## 📞 Support

For issues or questions:

1. Check the error logs in PostgreSQL
2. Verify API key configuration
3. Test with simple addresses first
4. Monitor rate limiting and API quotas
5. Review the setup script output

---

This PostgreSQL HTTP foreign data wrapper approach provides a robust, scalable, and maintainable solution for geocoding studio addresses directly in the database. 