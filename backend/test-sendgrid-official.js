// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail')

// Set API key from environment
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
// sgMail.setDataResidency('eu'); 
// uncomment the above line if you are sending mail using a regional EU subuser

console.log('🧪 Testing SendGrid with stan@berteloot.org...\n');

// Check if API key is set
if (!process.env.SENDGRID_API_KEY) {
  console.log('❌ SENDGRID_API_KEY not found in environment');
  console.log('Please set your SendGrid API key to test');
  process.exit(1);
}

console.log('✅ API Key found:', process.env.SENDGRID_API_KEY.substring(0, 10) + '...');

const msg = {
  to: 'berteloot@gmail.com',
  from: 'stan@berteloot.org', // Test with stan@berteloot.org
  subject: 'SendGrid Test - stan@berteloot.org',
  text: 'This is a test email from stan@berteloot.org to verify SendGrid is working.',
  html: '<h2>SendGrid Test</h2><p>This is a test email from <strong>stan@berteloot.org</strong> to verify SendGrid is working.</p><p>If you receive this, the email verification system is ready!</p>',
}

console.log('\n📧 Sending test email...');
console.log('To:', msg.to);
console.log('From:', msg.from);
console.log('Subject:', msg.subject);

sgMail
  .send(msg)
  .then(() => {
    console.log('✅ Email sent successfully!')
    console.log('Check berteloot@gmail.com for the test email')
  })
  .catch((error) => {
    console.log('❌ Error sending email:')
    console.log('Code:', error.code);
    console.log('Message:', error.message);
    
    if (error.response && error.response.body) {
      console.log('Response Body:', JSON.stringify(error.response.body, null, 2));
    }
    
    // Provide guidance based on error
    if (error.code === 401) {
      console.log('\n🔧 401 Unauthorized - Check your API key');
    } else if (error.code === 403) {
      console.log('\n🔧 403 Forbidden - Verify your sender email');
      console.log('You need to verify stan@berteloot.org in SendGrid Sender Authentication');
    }
  }) 