const sgMail = require('@sendgrid/mail');

// Direct SendGrid test
async function testSendGridDirect() {
  console.log('🧪 Direct SendGrid Test...\n');
  
  // Use the API key from environment
  const API_KEY = process.env.SENDGRID_API_KEY;
  const FROM_EMAIL = 'stan@altilead.com';
  
  if (!API_KEY) {
    console.log('❌ SENDGRID_API_KEY not found in environment');
    console.log('Please set your SendGrid API key to test');
    return;
  }
  
  console.log('API Key:', API_KEY.substring(0, 10) + '...');
  console.log('From Email:', FROM_EMAIL);
  
  // Set API key
  sgMail.setApiKey(API_KEY);
  
  try {
    console.log('\n📧 Sending test email...');
    
    const testMsg = {
      to: 'test@example.com', // This will fail but we can see the error
      from: {
        email: FROM_EMAIL,
        name: 'Tattooed World Test'
      },
      subject: 'SendGrid API Test - Tattooed World',
      text: 'This is a test email to verify SendGrid configuration.',
      html: '<p>This is a test email to verify SendGrid configuration.</p>'
    };
    
    const response = await sgMail.send(testMsg);
    console.log('✅ SendGrid API key is valid!');
    console.log('Status Code:', response[0].statusCode);
    
  } catch (error) {
    console.log('\n❌ SendGrid Error:');
    console.log('Code:', error.code);
    console.log('Message:', error.message);
    
    if (error.response) {
      console.log('Response Body:', JSON.stringify(error.response.body, null, 2));
    }
    
    // Analyze the error
    if (error.code === 401) {
      console.log('\n🔧 401 Unauthorized - API key might be invalid or revoked');
    } else if (error.code === 403) {
      console.log('\n🔧 403 Forbidden - Sender email might not be verified');
    } else if (error.message.includes('test@example.com')) {
      console.log('\n✅ This is expected - test@example.com is not a real email');
      console.log('The API key is working, but the recipient email is invalid');
    }
  }
}

// Run the test
testSendGridDirect().catch(console.error); 