# Studio CSV Upload Guide

## Overview

The Studio CSV Upload feature allows administrators to bulk upload multiple studios to the system using a CSV file. This feature is designed to streamline the process of adding studio data to the platform.

## Access

- **URL**: `/admin/studios/upload`
- **Required Role**: ADMIN
- **Access**: Admin Dashboard → Studio CSV Upload

## Features

### 1. CSV Template Download
- Download a pre-formatted CSV template with all required and optional fields
- Template includes sample data to show the expected format
- Ensures proper column headers and data structure

### 2. Drag & Drop Upload
- Drag and drop CSV files directly onto the upload area
- File validation (CSV format only)
- Real-time file preview

### 3. CSV Preview
- Preview uploaded CSV data before processing
- Shows row count and data preview
- Validates file format and structure

### 4. Bulk Processing
- Process multiple studios in a single upload
- Detailed success/failure reporting
- Error tracking with line numbers
- Progress indicators during upload

### 5. Results Dashboard
- Summary statistics (total, successful, failed)
- Success rate calculation
- Detailed error messages
- Audit trail logging

## CSV Format Requirements

### Required Fields
- `title` - Studio name
- `address` - Street address
- `city` - City name
- `state` - State/province

### Optional Fields
- `zipcode` - ZIP/postal code
- `country` - Country (defaults to "USA")
- `phone` - Phone number
- `email` - Email address
- `website` - Website URL

### Social Media Fields
- `facebook` - Facebook URL
- `instagram` - Instagram URL
- `twitter` - Twitter URL
- `linkedin` - LinkedIn URL
- `youtube` - YouTube URL

### Location Fields
- `latitude` - Latitude coordinate (decimal format)
- `longitude` - Longitude coordinate (decimal format)

## CSV Format Example

```csv
title,address,city,state,zipcode,country,phone,email,website,facebook,instagram,twitter,linkedin,youtube,latitude,longitude
"Studio Name","123 Main St","New York","NY","10001","USA","555-123-4567","studio@example.com","https://studio.com","https://facebook.com/studio","https://instagram.com/studio","https://twitter.com/studio","https://linkedin.com/studio","https://youtube.com/studio","40.7128","-74.0060"
```

## Usage Instructions

### Step 1: Access the Upload Page
1. Log in as an administrator
2. Navigate to Admin Dashboard
3. Click "Studio CSV Upload" in the quick actions

### Step 2: Download Template (Optional)
1. Click "Download Template" button
2. Save the CSV file to your computer
3. Use as a reference for your data format

### Step 3: Prepare Your CSV File
1. Create a CSV file with the required headers
2. Add your studio data following the template format
3. Ensure all required fields are filled
4. Use quotes around fields containing commas
5. Save the file with .csv extension

### Step 4: Upload the File
1. Drag and drop your CSV file onto the upload area, or
2. Click "browse" to select the file from your computer
3. Review the CSV preview to ensure data is correct
4. Click "Upload Studios" to process the file

### Step 5: Review Results
1. Check the upload summary statistics
2. Review any error messages
3. Verify studios were created successfully
4. Access the Studios page to see uploaded studios

## Data Processing Rules

### Studio Creation
- All uploaded studios are created with `isVerified: false`
- Verification status is set to `PENDING`
- Studios are set as active by default
- Slug is automatically generated from the title

### Data Validation
- Required fields are validated before processing
- Invalid data rows are skipped and reported
- Duplicate slugs are handled automatically
- Coordinate data is validated for numeric format

### Error Handling
- Missing required fields are reported with line numbers
- Invalid data formats are clearly identified
- Processing continues even if some rows fail
- Detailed error messages help identify issues

## API Endpoints

### Upload Studios
```
POST /api/admin/upload-studios-csv
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "csvData": "title,address,city,state...\n..."
}
```

### Download Template
```
GET /api/admin/studios-csv-template
Authorization: Bearer <admin_token>
```

## Security Features

### Access Control
- Admin-only access required
- JWT token authentication
- Role-based authorization

### Data Validation
- Input sanitization
- SQL injection prevention
- File type validation
- Size limits enforced

### Audit Trail
- All uploads are logged in AdminAction table
- Upload details and results are recorded
- Admin user is tracked for accountability

## Troubleshooting

### Common Issues

#### "Missing required headers" Error
- Ensure your CSV has the correct header row
- Check that required fields (title, address, city, state) are present
- Verify header names match exactly (case-insensitive)

#### "Column count mismatch" Error
- Check for extra or missing commas in your data
- Ensure quoted fields are properly closed
- Verify no trailing commas in header row

#### "Invalid data" Errors
- Check coordinate format (decimal numbers only)
- Verify phone numbers are in valid format
- Ensure URLs are properly formatted

#### Upload Fails
- Check file size (max 10MB)
- Verify file is valid CSV format
- Ensure you have admin privileges
- Check server logs for detailed errors

### Best Practices

1. **Test with Small Files First**
   - Start with 2-3 studios to test the format
   - Verify everything works before uploading large files

2. **Use the Template**
   - Download and use the provided template
   - Follow the exact format and structure

3. **Validate Your Data**
   - Check all required fields are filled
   - Verify coordinate data is numeric
   - Ensure URLs are properly formatted

4. **Backup Your Data**
   - Keep a copy of your original CSV file
   - Document any manual corrections made

5. **Review Results**
   - Always check the upload results
   - Address any errors before uploading more data

## Support

If you encounter issues with the CSV upload feature:

1. Check the error messages in the upload results
2. Verify your CSV format matches the template
3. Test with a smaller file first
4. Contact system administrator if problems persist

## Technical Details

### File Processing
- CSV parsing handles quoted fields
- Automatic slug generation from titles
- Batch processing for performance
- Transaction-based uploads

### Database Integration
- Uses Prisma ORM for data insertion
- Automatic relationship handling
- Constraint validation
- Error rollback on failures

### Performance Considerations
- Large files are processed in batches
- Memory-efficient CSV parsing
- Progress indicators for user feedback
- Timeout handling for long uploads 