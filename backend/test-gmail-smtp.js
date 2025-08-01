const nodemailer = require('nodemailer');

console.log('🧪 Testing Gmail SMTP...\n');

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'your-email@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
  }
});

async function testGmailSMTP() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('❌ Gmail credentials not found in environment');
    console.log('To use Gmail SMTP:');
    console.log('1. Enable 2-factor authentication on your Gmail account');
    console.log('2. Generate an App Password');
    console.log('3. Set environment variables:');
    console.log('   GMAIL_USER=your-email@gmail.com');
    console.log('   GMAIL_APP_PASSWORD=your-app-password');
    return;
  }

  console.log('✅ Gmail credentials found');
  console.log('User:', process.env.GMAIL_USER);

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: 'berteloot@gmail.com',
    subject: 'Gmail SMTP Test - Tattooed World',
    text: 'This is a test email using Gmail SMTP.',
    html: '<h2>Gmail SMTP Test</h2><p>This is a test email using Gmail SMTP for Tattooed World app.</p>'
  };

  console.log('\n📧 Sending test email...');
  console.log('To:', mailOptions.to);
  console.log('From:', mailOptions.from);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Check berteloot@gmail.com for the test email');
  } catch (error) {
    console.log('❌ Error sending email:');
    console.log('Error:', error.message);
  }
}

// Run the test
testGmailSMTP().catch(console.error); 