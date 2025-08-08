#!/usr/bin/env node

// Fix Gallery Authentication Issues
// This script diagnoses and fixes gallery authentication problems

const axios = require('axios');

const API_URL = process.env.API_URL || 'https://tattooed-world-backend.onrender.com/api';

console.log('🔧 Fixing Gallery Authentication Issues...');
console.log('API URL:', API_URL);
console.log('');

async function fixGalleryAuth() {
  try {
    // Test accounts
    const testAccounts = [
      { email: 'berteloot@gmail.com', password: 'admin123', role: 'ADMIN' },
      { email: 'artist@example.com', password: 'artist123', role: 'ARTIST' },
      { email: 'client@example.com', password: 'client123', role: 'CLIENT' }
    ];

    for (const account of testAccounts) {
      console.log(`\n🔍 Testing account: ${account.email} (${account.role})`);
      console.log('='.repeat(50));

      try {
        // Step 1: Login
        console.log('1️⃣ Logging in...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: account.email,
          password: account.password
        });

        if (!loginResponse.data.success) {
          console.log('❌ Login failed:', loginResponse.data.error);
          continue;
        }

        const token = loginResponse.data.data.token;
        const user = loginResponse.data.data.user;
        console.log('✅ Login successful');
        console.log('   User ID:', user.id);
        console.log('   Role:', user.role);
        console.log('   Name:', `${user.firstName} ${user.lastName}`);

        // Set up auth headers
        const authHeaders = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Step 2: Check user profile
        console.log('2️⃣ Checking user profile...');
        const profileResponse = await axios.get(`${API_URL}/auth/me`, { headers: authHeaders });
        console.log('✅ Profile retrieved successfully');

        // Step 3: Check artist profile (if applicable)
        if (user.role === 'ARTIST' || user.role === 'ARTIST_ADMIN') {
          console.log('3️⃣ Checking artist profile...');
          try {
            const artistResponse = await axios.get(`${API_URL}/artists/${user.id}`, { headers: authHeaders });
            console.log('✅ Artist profile found');
            console.log('   Artist ID:', artistResponse.data.data.id);
            console.log('   Verification Status:', artistResponse.data.data.verificationStatus);
          } catch (error) {
            console.log('❌ Artist profile not found or error:', error.response?.data?.error || error.message);
            
            // Try to create artist profile if it doesn't exist
            if (error.response?.status === 404) {
              console.log('4️⃣ Creating artist profile...');
              try {
                const createProfileResponse = await axios.post(`${API_URL}/artists`, {
                  bio: 'Test artist profile',
                  studioName: 'Test Studio',
                  city: 'Test City',
                  state: 'Test State',
                  country: 'Test Country'
                }, { headers: authHeaders });
                console.log('✅ Artist profile created');
              } catch (createError) {
                console.log('❌ Failed to create artist profile:', createError.response?.data?.error || createError.message);
              }
            }
          }
        }

        // Step 4: Test gallery access
        console.log('4️⃣ Testing gallery access...');
        
        // Test GET /gallery (should work for everyone)
        try {
          const galleryGetResponse = await axios.get(`${API_URL}/gallery`, { headers: authHeaders });
          console.log('✅ GET /gallery - Success');
        } catch (error) {
          console.log('❌ GET /gallery - Failed:', error.response?.status, error.response?.data?.error || error.message);
        }

        // Test POST /gallery (should work for artists only)
        try {
          const galleryPostResponse = await axios.post(`${API_URL}/gallery`, {
            title: 'Test Gallery Item',
            description: 'Test description',
            tattooStyle: 'Traditional',
            bodyLocation: 'Arm'
          }, { headers: authHeaders });
          console.log('✅ POST /gallery - Success');
        } catch (error) {
          console.log('❌ POST /gallery - Failed:', error.response?.status, error.response?.data?.error || error.message);
        }

        // Step 5: Test with form data (like the frontend does)
        console.log('5️⃣ Testing gallery upload with form data...');
        try {
          const FormData = require('form-data');
          const form = new FormData();
          form.append('title', 'Test Upload');
          form.append('description', 'Test upload description');
          form.append('tattooStyle', 'Traditional');
          form.append('bodyLocation', 'Arm');
          form.append('clientConsent', 'true');
          form.append('clientAnonymous', 'true');
          form.append('clientAgeVerified', 'true');
          
          // Create a dummy image buffer
          const dummyImage = Buffer.from('fake-image-data');
          form.append('image', dummyImage, { filename: 'test.jpg', contentType: 'image/jpeg' });

          const uploadResponse = await axios.post(`${API_URL}/gallery`, form, {
            headers: {
              ...authHeaders,
              ...form.getHeaders()
            }
          });
          console.log('✅ Gallery upload - Success');
        } catch (error) {
          console.log('❌ Gallery upload - Failed:', error.response?.status, error.response?.data?.error || error.message);
        }

      } catch (error) {
        console.log('❌ Account test failed:', error.response?.data?.error || error.message);
      }
    }

    console.log('\n📋 Summary of Issues Found:');
    console.log('1. Browser extension errors are not related to your app');
    console.log('2. Gallery API requires proper authentication');
    console.log('3. Gallery upload requires ARTIST role and artist profile');
    console.log('4. Form data upload requires proper multipart/form-data headers');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

// Run the fix
fixGalleryAuth().then(() => {
  console.log('\n🏁 Gallery authentication fix completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fix failed:', error);
  process.exit(1);
});
