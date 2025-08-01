const sgMail = require('@sendgrid/mail');

// This test requires you to set your SendGrid API key
async function testSendGridDirect() {
  console.log('🧪 Direct SendGrid Test\n');

  // You need to set your SendGrid API key here for testing
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  
  if (!SENDGRID_API_KEY) {
    console.log('❌ SENDGRID_API_KEY not found in environment');
    console.log('   Please set your SendGrid API key to test');
    console.log('   Example: SENDGRID_API_KEY=your_key_here node test-sendgrid-direct.js');
    return;
  }

  console.log('✅ SendGrid API key found');
  console.log('   Key length:', SENDGRID_API_KEY.length);
  console.log('   Key starts with:', SENDGRID_API_KEY.substring(0, 10) + '...');

  try {
    // Configure SendGrid
    sgMail.setApiKey(SENDGRID_API_KEY);
    console.log('✅ SendGrid configured successfully');

    // Test email
    const testEmail = {
      to: 'test@example.com',
      from: {
        email: 'stan@altilead.com',
        name: 'Tattooed World'
      },
      subject: 'SendGrid Test - Tattooed World',
      html: '<h1>SendGrid Test</h1><p>This is a test email to verify SendGrid configuration.</p>',
      text: 'SendGrid Test - This is a test email to verify SendGrid configuration.'
    };

    console.log('\n📧 Sending test email...');
    const response = await sgMail.send(testEmail);
    
    console.log('✅ Test email sent successfully!');
    console.log('   Status Code:', response[0].statusCode);
    console.log('   Message ID:', response[0].headers['x-message-id']);
    
    console.log('\n🎉 SendGrid is working correctly!');
    console.log('   - API Key: Valid');
    console.log('   - Domain: Authenticated');
    console.log('   - Sending: Working');

  } catch (error) {
    console.log('❌ SendGrid test failed');
    console.log('   Error:', error.message);
    
    if (error.response) {
      console.log('   Response body:', error.response.body);
      
      // Check for specific error types
      if (error.response.body && error.response.body.errors) {
        error.response.body.errors.forEach(err => {
          console.log('   - Error:', err.message);
          if (err.field) {
            console.log('     Field:', err.field);
          }
        });
      }
    }

    console.log('\n🔍 Common SendGrid Issues:');
    console.log('   1. Invalid API key');
    console.log('   2. Domain not authenticated');
    console.log('   3. Account suspended or limited');
    console.log('   4. Sender email not verified');
  }
}

// Run the test
testSendGridDirect(); 