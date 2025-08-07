const fs = require('fs');
const path = require('path');

// Test the profile picture upload endpoint
async function testProfilePictureUpload() {
  console.log('🧪 Testing Profile Picture Upload...');
  
  try {
    // First, login to get a token
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'artist@example.com',
        password: 'artist123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;

    console.log('✅ Login successful');

    // Test the profile picture upload endpoint
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    
    // Create a simple test image if it doesn't exist
    if (!fs.existsSync(testImagePath)) {
      console.log('📝 Creating test image...');
      // Create a minimal JPEG file for testing
      const minimalJpeg = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
        0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
        0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
        0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
        0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
        0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0x00,
        0x07, 0xFF, 0xD9
      ]);
      fs.writeFileSync(testImagePath, minimalJpeg);
    }

    // Create form data for upload
    const formData = new FormData();
    const imageBuffer = fs.readFileSync(testImagePath);
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    formData.append('image', blob, 'test-image.jpg');

    console.log('📤 Uploading test image...');

    const uploadResponse = await fetch('http://localhost:3001/api/artists/profile-picture/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Upload failed:', errorText);
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    console.log('✅ Upload successful:', uploadData);

    // Test the profile picture removal endpoint
    console.log('🗑️ Testing profile picture removal...');
    
    const deleteResponse = await fetch('http://localhost:3001/api/artists/profile-picture', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('❌ Delete failed:', errorText);
      throw new Error(`Delete failed: ${deleteResponse.status}`);
    }

    const deleteData = await deleteResponse.json();
    console.log('✅ Delete successful:', deleteData);

    console.log('🎉 All profile picture tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProfilePictureUpload(); 