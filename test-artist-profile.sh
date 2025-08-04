#!/bin/bash

echo "🧪 Testing Artist Profile Access...\n"

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
  
  # Extract token and user ID
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  USER_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  ARTIST_PROFILE_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"artistProfile":{"id":"[^"]*"' | cut -d'"' -f6)
  
  echo "✅ User ID: $USER_ID"
  echo "✅ Artist Profile ID: $ARTIST_PROFILE_ID"
  
  if [ -n "$TOKEN" ]; then
    echo "✅ Token extracted: ${TOKEN:0:20}..."
    
    # Test 2: Get artist profile by ID
    if [ -n "$ARTIST_PROFILE_ID" ]; then
      echo "\n🔄 Step 2: Getting artist profile by ID..."
      PROFILE_RESPONSE=$(curl -s -X GET http://localhost:3001/api/artists/$ARTIST_PROFILE_ID \
        -H "Authorization: Bearer $TOKEN")
      
      echo "✅ Profile Response: $PROFILE_RESPONSE"
      
      if echo "$PROFILE_RESPONSE" | grep -q '"success":true'; then
        echo "✅ Artist profile retrieved successfully!"
        
        # Test 3: Update artist profile
        echo "\n🔄 Step 3: Testing profile update..."
        UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:3001/api/artists/$ARTIST_PROFILE_ID \
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
        echo "❌ Could not retrieve artist profile"
      fi
    else
      echo "❌ No artist profile ID found in login response"
    fi
    
    # Test 4: Test getting all artists (should include this artist)
    echo "\n🔄 Step 4: Testing get all artists..."
    ALL_ARTISTS_RESPONSE=$(curl -s -X GET http://localhost:3001/api/artists \
      -H "Authorization: Bearer $TOKEN")
    
    echo "✅ All Artists Response: $ALL_ARTISTS_RESPONSE"
    
    if echo "$ALL_ARTISTS_RESPONSE" | grep -q '"success":true'; then
      echo "✅ Get all artists successful!"
      
      # Check if our artist is in the list
      if echo "$ALL_ARTISTS_RESPONSE" | grep -q "artist@example.com"; then
        echo "✅ Our artist found in the list!"
      else
        echo "❌ Our artist not found in the list"
      fi
    else
      echo "❌ Get all artists failed"
    fi
    
    echo "\n🎉 Artist profile test completed!"
    
  else
    echo "❌ Could not extract token from login response"
  fi
  
else
  echo "❌ Login failed"
fi

echo "\n�� Test completed!" 