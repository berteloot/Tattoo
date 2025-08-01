const sgMail = require('@sendgrid/mail');

// Test SendGrid configuration
async function testSendGridConfig() {
  console.log('🔍 Testing SendGrid Configuration...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('FROM_EMAIL:', process.env.FROM_EMAIL || 'stan@altilead.com');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'https://tattooed-world-backend.onrender.com');
  
  if (!process.env.SENDGRID_API_KEY) {
    console.log('\n❌ SENDGRID_API_KEY is not set. Please check your environment configuration.');
    return;
  }
  
  // Test API key format
  const apiKey = process.env.SENDGRID_API_KEY;
  console.log('\nAPI Key Format:');
  console.log('Length:', apiKey.length);
  console.log('Starts with SG.:', apiKey.startsWith('SG.'));
  console.log('Contains dots:', apiKey.includes('.'));
  
  // Set API key
  sgMail.setApiKey(apiKey);
  
  // Test API key validity by making a simple request
  try {
    console.log('\n🧪 Testing API key validity...');
    
    // Try to send a test email (this will fail but we can see the error)
    const testMsg = {
      to: 'test@example.com',
      from: {
        email: process.env.FROM_EMAIL || 'stan@altilead.com',
        name: 'Tattooed World Test'
      },
      subject: 'SendGrid API Test',
      text: 'This is a test email to verify SendGrid configuration.',
      html: '<p>This is a test email to verify SendGrid configuration.</p>'
    };
    
    const response = await sgMail.send(testMsg);
    console.log('✅ SendGrid API key is valid!');
    console.log('Response:', response[0].statusCode);
    
  } catch (error) {
    console.log('\n❌ SendGrid API Error:');
    console.log('Status Code:', error.code);
    console.log('Message:', error.message);
    
    if (error.response) {
      console.log('Response Body:', JSON.stringify(error.response.body, null, 2));
    }
    
    // Provide specific guidance based on error
    if (error.code === 401) {
      console.log('\n🔧 Troubleshooting 401 Unauthorized:');
      console.log('1. Check if the API key is correct in Render environment variables');
      console.log('2. Verify the API key has the necessary permissions (Mail Send)');
      console.log('3. Ensure the sender email is verified in SendGrid');
      console.log('4. Check if the API key is active and not revoked');
    } else if (error.code === 403) {
      console.log('\n🔧 Troubleshooting 403 Forbidden:');
      console.log('1. Check if the sender email is verified in SendGrid');
      console.log('2. Verify the API key has Mail Send permissions');
    }
  }
}

// Run the test
testSendGridConfig().catch(console.error); 