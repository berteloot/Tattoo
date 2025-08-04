#!/bin/bash

echo "🧪 Testing Complete Artist Flow...\n"

# Test 1: Login with existing artist account
echo "🔄 Step 1: Logging in with existing artist account..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artist@example.com",
    "password": "artist123"
  }')

echo "✅ Login Response: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Login successful!"
  
  # Extract token
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  
  if [ -n "$TOKEN" ]; then
    echo "✅ Token extracted: ${TOKEN:0:20}..."
    
    # Test 2: Check if artist profile exists
    echo "\n🔄 Step 2: Checking existing artist profile..."
    PROFILE_RESPONSE=$(curl -s -X GET http://localhost:3001/api/artists/me \
      -H "Authorization: Bearer $TOKEN")
    
    echo "✅ Profile Response: $PROFILE_RESPONSE"
    
    if echo "$PROFILE_RESPONSE" | grep -q '"success":true'; then
      echo "✅ Artist profile exists!"
      
      # Test 3: Test profile update
      echo "\n🔄 Step 3: Testing profile update..."
      UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:3001/api/artists/me \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
          "bio": "Updated test bio",
          "studioName": "Updated Test Studio"
        }')
      
      echo "✅ Update Response: $UPDATE_RESPONSE"
      
      if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
        echo "✅ Profile update successful!"
      else
        echo "❌ Profile update failed"
      fi
      
    else
      echo "❌ No existing profile found, testing profile creation..."
      
      # Test 4: Create artist profile
      echo "\n🔄 Step 4: Creating artist profile..."
      CREATE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/artists \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
          "studioName": "Test Studio",
          "bio": "Test artist bio",
          "specialties": ["Traditional", "Japanese"],
          "services": ["Custom Design", "Cover-up"],
          "location": {
            "latitude": 40.7128,
            "longitude": -74.0060,
            "address": "New York, NY"
          }
        }')
      
      echo "✅ Create Profile Response: $CREATE_RESPONSE"
      
      if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
        echo "✅ Artist profile created successfully!"
      else
        echo "❌ Artist profile creation failed"
      fi
    fi
    
    # Test 5: Test artist dashboard access
    echo "\n🔄 Step 5: Testing artist dashboard access..."
    DASHBOARD_RESPONSE=$(curl -s -X GET http://localhost:3001/api/artists/dashboard \
      -H "Authorization: Bearer $TOKEN")
    
    echo "✅ Dashboard Response: $DASHBOARD_RESPONSE"
    
    if echo "$DASHBOARD_RESPONSE" | grep -q '"success":true'; then
      echo "✅ Artist dashboard access successful!"
    else
      echo "❌ Artist dashboard access failed"
    fi
    
    echo "\n🎉 Complete artist flow test completed!"
    
  else
    echo "❌ Could not extract token from login response"
  fi
  
else
  echo "❌ Login failed"
fi

echo "\n�� Test completed!" 