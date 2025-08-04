# Artist Featuring Guide for Admins

## Overview
As an admin, you can feature artists to promote them on the platform. Featured artists appear prominently in the "Featured Artists" section on the homepage and receive increased visibility.

## How to Feature an Artist

### Method 1: Using the Artist Management Page (Recommended)

1. **Access the Artist Management Page**
   - Go to Admin Dashboard
   - Click on "Artist Management" 
   - Or navigate directly to `/admin/artists`

2. **Find the Artist**
   - Use the search bar to find artists by name or email
   - Use filters to narrow down results:
     - Verification Status (Pending, Approved, Rejected, Suspended)
     - Featured Status (Featured, Not Featured)
     - Verified Status (Verified, Not Verified)

3. **Feature the Artist**
   - Click the "Feature" button next to the artist's name
   - A confirmation modal will appear
   - Optionally add a reason for featuring
   - Click "Feature" to confirm

4. **Unfeature an Artist**
   - Click the "Unfeature" button next to a featured artist
   - Confirm in the modal
   - The artist will be removed from the featured section

### Method 2: Using the API Directly (Advanced)

You can also feature artists using the API endpoint:

```bash
# Feature an artist
curl -X PUT http://localhost:3001/api/admin/artists/{artist_id}/feature \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isFeatured": true, "reason": "Outstanding work quality"}'

# Unfeature an artist
curl -X PUT http://localhost:3001/api/admin/artists/{artist_id}/feature \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isFeatured": false, "reason": "Removing from featured list"}'
```

## Current Featured Artists

To check which artists are currently featured, you can:

1. **View in the Artist Management Page**
   - Filter by "Featured Status: Featured"
   - See all featured artists in the list

2. **Check the Database**
   ```sql
   SELECT 
     ap.id,
     u.firstName,
     u.lastName,
     u.email,
     ap.studioName,
     ap.isFeatured,
     ap.verificationStatus,
     ap.createdAt
   FROM artist_profiles ap
   JOIN users u ON ap.userId = u.id
   WHERE ap.isFeatured = true
   ORDER BY ap.updatedAt DESC;
   ```

## Best Practices for Featuring Artists

### Criteria for Featuring
- **Quality of Work**: Artists with exceptional portfolio
- **Verified Status**: Only feature verified artists
- **Active Engagement**: Artists who respond to clients
- **Positive Reviews**: High ratings and positive feedback
- **Complete Profiles**: Artists with full profile information

### Guidelines
1. **Limit Featured Artists**: Don't feature too many artists at once (recommended: 3-5)
2. **Regular Rotation**: Consider rotating featured artists monthly
3. **Diverse Representation**: Feature artists from different styles and locations
4. **Performance Monitoring**: Monitor featured artists' performance

## Paid Feature Preparation

The system is designed to support paid featuring in the future. Current features that support this:

### Database Structure
- `isFeatured` field in `artist_profiles` table
- `featuredAt` timestamp (can be added)
- `featuredUntil` expiration date (can be added)
- `featuredReason` for admin notes (can be added)

### API Endpoints Ready
- `PUT /api/admin/artists/:id/feature` - Feature/unfeature artists
- Audit trail logging for all feature actions
- Admin action tracking

### Future Enhancements
1. **Time-based Featuring**
   ```sql
   ALTER TABLE artist_profiles 
   ADD COLUMN featured_at TIMESTAMP,
   ADD COLUMN featured_until TIMESTAMP,
   ADD COLUMN featured_reason TEXT;
   ```

2. **Paid Feature Tiers**
   ```sql
   CREATE TABLE feature_tiers (
     id SERIAL PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     duration_days INTEGER NOT NULL,
     price DECIMAL(10,2) NOT NULL,
     description TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Feature Subscriptions**
   ```sql
   CREATE TABLE artist_features (
     id SERIAL PRIMARY KEY,
     artist_id VARCHAR(255) REFERENCES artist_profiles(id),
     tier_id INTEGER REFERENCES feature_tiers(id),
     start_date TIMESTAMP NOT NULL,
     end_date TIMESTAMP NOT NULL,
     payment_status VARCHAR(50) DEFAULT 'pending',
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

## Troubleshooting

### Common Issues

1. **Artist Not Appearing as Featured**
   - Check if the artist is verified (`isVerified = true`)
   - Verify the feature action was successful in audit log
   - Check if there are any database constraints

2. **Feature Action Fails**
   - Ensure you have admin privileges
   - Check if the artist profile exists
   - Verify the API endpoint is accessible

3. **Featured Artists Not Showing on Frontend**
   - Check the frontend API call to `/api/artists?featured=true`
   - Verify the artist has `isFeatured = true` in database
   - Check for any frontend caching issues

### Database Queries for Debugging

```sql
-- Check all featured artists
SELECT 
  u.firstName, 
  u.lastName, 
  u.email, 
  ap.studioName, 
  ap.isFeatured, 
  ap.verificationStatus,
  ap.updatedAt
FROM artist_profiles ap
JOIN users u ON ap.userId = u.id
WHERE ap.isFeatured = true
ORDER BY ap.updatedAt DESC;

-- Check recent feature actions
SELECT 
  aa.action,
  aa.details,
  aa.createdAt,
  u.firstName,
  u.lastName
FROM admin_actions aa
JOIN users u ON aa.adminId = u.id
WHERE aa.action IN ('FEATURE_ARTIST', 'UNFEATURE_ARTIST')
ORDER BY aa.createdAt DESC
LIMIT 10;

-- Count featured vs non-featured artists
SELECT 
  isFeatured,
  COUNT(*) as count
FROM artist_profiles
GROUP BY isFeatured;
```

## Security Considerations

1. **Access Control**: Only admins can feature artists
2. **Audit Trail**: All feature actions are logged
3. **Validation**: Artists must be verified before featuring
4. **Rate Limiting**: API endpoints are rate-limited

## Monitoring and Analytics

Track featuring effectiveness:
- Profile views for featured artists
- Contact rate for featured artists
- Revenue impact of featuring
- Client satisfaction with featured artists

## Support

If you encounter issues with featuring artists:
1. Check the audit log for error details
2. Verify database connectivity
3. Test the API endpoint directly
4. Contact system administrator if problems persist 