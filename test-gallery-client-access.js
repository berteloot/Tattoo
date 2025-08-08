// Test script to verify gallery access for clients
// Run this in browser console when logged in as a client

console.log('🔍 Testing gallery access for clients...');

// Test 1: Check if we can fetch gallery items
async function testGalleryAccess() {
  try {
    console.log('📋 Test 1: Fetching gallery items...');
    
    const response = await fetch('/api/gallery');
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (data.success && data.data && data.data.items) {
      console.log(`✅ Gallery access successful! Found ${data.data.items.length} items`);
      
      if (data.data.items.length > 0) {
        console.log('📋 Sample items:');
        data.data.items.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title} by ${item.artist?.user?.firstName} ${item.artist?.user?.lastName}`);
        });
      } else {
        console.log('⚠️ Gallery is empty - no items found');
      }
    } else {
      console.log('❌ Gallery access failed or no items found');
    }
    
  } catch (error) {
    console.error('❌ Error testing gallery access:', error);
  }
}

// Test 2: Check specific gallery item
async function testGalleryItemAccess() {
  try {
    console.log('\n📋 Test 2: Testing specific gallery item access...');
    
    // First get gallery items to find an ID
    const response = await fetch('/api/gallery');
    const data = await response.json();
    
    if (data.success && data.data && data.data.items && data.data.items.length > 0) {
      const firstItem = data.data.items[0];
      console.log(`Testing access to item: ${firstItem.title} (ID: ${firstItem.id})`);
      
      const itemResponse = await fetch(`/api/gallery/${firstItem.id}`);
      const itemData = await itemResponse.json();
      
      console.log('Item response status:', itemResponse.status);
      console.log('Item response data:', itemData);
      
      if (itemData.success) {
        console.log('✅ Individual gallery item access successful!');
      } else {
        console.log('❌ Individual gallery item access failed');
      }
    } else {
      console.log('⚠️ No gallery items available to test');
    }
    
  } catch (error) {
    console.error('❌ Error testing gallery item access:', error);
  }
}

// Run tests
testGalleryAccess().then(() => {
  setTimeout(testGalleryItemAccess, 1000);
});

console.log('🚀 Gallery tests started. Check console for results...');
