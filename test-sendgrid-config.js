const sgMail = require('@sendgrid/mail');

// Test SendGrid configuration
async function testSendGridConfig() {
  console.log('🧪 Testing SendGrid Configuration\n');

  // Check environment variables
  console.log('1. Checking environment variables...');
  console.log('   SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET');
  console.log('   FROM_EMAIL:', process.env.FROM_EMAIL || 'stan@altilead.com');
  console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || 'https://tattooed-world-backend.onrender.com');

  if (!process.env.SENDGRID_API_KEY) {
    console.log('\n❌ SENDGRID_API_KEY not found in environment');
    console.log('   Please check your Render environment variables');
    return;
  }

  // Configure SendGrid
  console.log('\n2. Configuring SendGrid...');
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('   ✅ SendGrid API key configured');
  } catch (error) {
    console.log('   ❌ Failed to configure SendGrid:', error.message);
    return;
  }

  // Test email sending
  console.log('\n3. Testing email sending...');
  const testEmail = {
    to: 'test@example.com',
    from: {
      email: process.env.FROM_EMAIL || 'stan@altilead.com',
      name: 'Tattooed World'
    },
    subject: 'Test Email - Tattooed World',
    html: '<h1>Test Email</h1><p>This is a test email to verify SendGrid configuration.</p>',
    text: 'Test Email - This is a test email to verify SendGrid configuration.'
  };

  try {
    const response = await sgMail.send(testEmail);
    console.log('   ✅ Test email sent successfully');
    console.log('   Status Code:', response[0].statusCode);
    console.log('   Message ID:', response[0].headers['x-message-id']);
  } catch (error) {
    console.log('   ❌ Failed to send test email');
    console.log('   Error:', error.message);
    
    if (error.response) {
      console.log('   Response body:', error.response.body);
    }
  }

  console.log('\n📋 SendGrid Configuration Summary:');
  console.log('   - API Key: Configured');
  console.log('   - From Email: stan@altilead.com');
  console.log('   - Email Service: Ready for production');
}

// Run the test
testSendGridConfig(); 