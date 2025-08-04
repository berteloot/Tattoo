#!/bin/bash

echo "🧪 Testing Artist Registration with curl...\n"

# Generate unique email
EMAIL="test-artist-$(date +%s)@example.com"
echo "📝 Using email: $EMAIL"

# Test 1: Register artist
echo "\n🔄 Step 1: Registering artist..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"Artist\",
    \"email\": \"$EMAIL\",
    \"password\": \"password123\",
    \"role\": \"ARTIST\"
  }")

echo "✅ Registration Response: $REGISTER_RESPONSE"

# Check if registration was successful
if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Registration successful!"
  
  # Test 2: Try to login (should fail due to email verification)
  echo "\n🔄 Step 2: Testing login (should fail due to email verification)..."
  LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"password123\"
    }")
  
  echo "✅ Login Response: $LOGIN_RESPONSE"
  
  if echo "$LOGIN_RESPONSE" | grep -q 'requiresEmailVerification'; then
    echo "✅ Login correctly blocked - email verification required"
  else
    echo "❌ Login should have been blocked but wasn't"
  fi
  
  # Test 3: Test with a known test email that bypasses verification
  echo "\n🔄 Step 3: Testing with test email that bypasses verification..."
  TEST_EMAIL="lisa@example.com"
  
  TEST_REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{
      \"firstName\": \"Test\",
      \"lastName\": \"Artist\",
      \"email\": \"$TEST_EMAIL\",
      \"password\": \"password123\",
      \"role\": \"ARTIST\"
    }")
  
  echo "✅ Test Registration Response: $TEST_REGISTER_RESPONSE"
  
  if echo "$TEST_REGISTER_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Test registration successful!"
    
    # Test 4: Login with test email
    echo "\n🔄 Step 4: Testing login with test email..."
    TEST_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"password123\"
      }")
    
    echo "✅ Test Login Response: $TEST_LOGIN_RESPONSE"
    
    if echo "$TEST_LOGIN_RESPONSE" | grep -q '"success":true'; then
      echo "✅ Test login successful!"
      
      # Extract token for profile creation test
      TOKEN=$(echo "$TEST_LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
      
      if [ -n "$TOKEN" ]; then
        echo "✅ Token extracted: ${TOKEN:0:20}..."
        
        # Test 5: Create artist profile
        echo "\n🔄 Step 5: Testing artist profile creation..."
        PROFILE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/artists \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer $TOKEN" \
          -d "{
            \"studioName\": \"Test Studio\",
            \"bio\": \"Test artist bio\",
            \"specialties\": [\"Traditional\", \"Japanese\"],
            \"services\": [\"Custom Design\", \"Cover-up\"],
            \"location\": {
              \"latitude\": 40.7128,
              \"longitude\": -74.0060,
              \"address\": \"New York, NY\"
            }
          }")
        
        echo "✅ Profile Creation Response: $PROFILE_RESPONSE"
        
        if echo "$PROFILE_RESPONSE" | grep -q '"success":true'; then
          echo "✅ Artist profile created successfully!"
          echo "🎉 Complete artist registration flow is working!"
        else
          echo "❌ Artist profile creation failed"
        fi
      else
        echo "❌ Could not extract token from login response"
      fi
    else
      echo "❌ Test login failed"
    fi
  else
    echo "❌ Test registration failed"
  fi
  
else
  echo "❌ Registration failed"
fi

echo "\n�� Test completed!" 