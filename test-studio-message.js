const axios = require('axios');

const API_URL = 'https://tattooed-world-backend.onrender.com';

async function testStudioMessage() {
  console.log('🧪 Testing Studio Message Feature...\n');

  try {
    // First, let's get a studio to test with
    console.log('1. Fetching studios...');
    const studiosResponse = await axios.get(`${API_URL}/api/studios`);
    
    // console.log('Studios response:', JSON.stringify(studiosResponse.data, null, 2));
    
    if (!studiosResponse.data.success) {
      console.log('❌ Failed to fetch studios');
      return;
    }

    const studios = studiosResponse.data.data?.studios || studiosResponse.data.studios || [];
    
    if (!Array.isArray(studios) || studios.length === 0) {
      console.log('❌ No studios found to test with');
      console.log('Studios data:', studios);
      return;
    }

    // Find a studio with an email
    const studioWithEmail = studios.find(studio => studio.email);
    
    if (!studioWithEmail) {
      console.log('❌ No studios with email found to test with');
      return;
    }

    console.log(`✅ Found studio to test: ${studioWithEmail.title}`);
    console.log(`   - Email: ${studioWithEmail.email}`);
    console.log(`   - Address: ${studioWithEmail.address}, ${studioWithEmail.city}, ${studioWithEmail.state}`);

    // Test the message endpoint
    console.log('\n2. Testing message endpoint...');
    
    const messageData = {
      studioId: studioWithEmail.id,
      studioName: studioWithEmail.title,
      studioEmail: studioWithEmail.email,
      studioAddress: `${studioWithEmail.address}, ${studioWithEmail.city}, ${studioWithEmail.state} ${studioWithEmail.zipCode}`,
      subject: 'Test Message from Tattoo App',
      message: 'Hi! I am interested in getting a tattoo and would like to know more about your services. This is a test message from the Tattooed World platform.',
      clientName: 'John Doe',
      clientEmail: 'john.doe@example.com',
      clientPhone: '+1 (555) 123-4567'
    };

    const messageResponse = await axios.post(`${API_URL}/api/studios/${studioWithEmail.id}/contact`, {
      subject: messageData.subject,
      message: messageData.message,
      senderName: messageData.clientName,
      senderEmail: messageData.clientEmail,
      senderPhone: messageData.clientPhone
    });
    
    if (messageResponse.data.success) {
      console.log('✅ Message sent successfully!');
      console.log(`   - Response: ${messageResponse.data.message}`);
    } else {
      console.log('❌ Failed to send message');
      console.log(`   - Error: ${messageResponse.data.error}`);
    }

  } catch (error) {
    console.error('❌ Error testing studio message:', error.response?.data || error.message);
  }
}

testStudioMessage();
