const sgMail = require('@sendgrid/mail')

// Set API key from environment
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

console.log('🧪 Testing SendGrid with Default Sender...\n');

if (!process.env.SENDGRID_API_KEY) {
  console.log('❌ SENDGRID_API_KEY not found in environment');
  process.exit(1);
}

console.log('✅ API Key found:', process.env.SENDGRID_API_KEY.substring(0, 10) + '...');

// Try using SendGrid's default sender
const msg = {
  to: 'berteloot@gmail.com',
  from: 'noreply@sendgrid.net', // SendGrid's default sender
  subject: 'SendGrid Test - Default Sender',
  text: 'This is a test email using SendGrid default sender.',
  html: '<h2>SendGrid Test</h2><p>This is a test email using SendGrid default sender.</p>',
}

console.log('\n📧 Sending test email...');
console.log('To:', msg.to);
console.log('From:', msg.from);

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
  }) 