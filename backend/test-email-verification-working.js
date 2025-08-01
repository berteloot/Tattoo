const sgMail = require('@sendgrid/mail');

// Test email verification with working sender
async function testEmailVerification() {
  console.log('🧪 Testing Email Verification System...\n');
  
  // Set API key
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  if (!process.env.SENDGRID_API_KEY) {
    console.log('❌ SENDGRID_API_KEY not found in environment');
    return;
  }
  
  console.log('✅ API Key found:', process.env.SENDGRID_API_KEY.substring(0, 10) + '...');
  
  // Test email verification email
  const verificationToken = 'test-verification-token-12345';
  const verificationUrl = `https://tattooed-world-app.onrender.com/verify-email?token=${verificationToken}`;
  
  const msg = {
    to: 'berteloot@gmail.com',
    from: {
      email: 'stan@berteloot.org',
      name: 'Tattooed World'
    },
    subject: 'Verify Your Email - Tattooed World 🎨',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Verify Your Email</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Complete your Tattooed World registration</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi Test User!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for joining Tattooed World! To complete your registration and start exploring amazing tattoo artists, 
            please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Welcome to the Tattooed World community!<br>
            <strong>Tattooed World Team</strong>
          </p>
        </div>
      </div>
    `,
    text: `Verify Your Email - Tattooed World

Hi Test User!

Thank you for joining Tattooed World! To complete your registration, please verify your email address by clicking this link:

${verificationUrl}

Welcome to the Tattooed World community!
Tattooed World Team`
  };

  console.log('\n📧 Sending email verification email...');
  console.log('To:', msg.to);
  console.log('From:', msg.from.email);
  console.log('Subject:', msg.subject);
  console.log('Verification URL:', verificationUrl);

  try {
    const response = await sgMail.send(msg);
    console.log('✅ Email verification email sent successfully!');
    console.log('Status Code:', response[0].statusCode);
    console.log('Check berteloot@gmail.com for the verification email');
    console.log('\n🎉 Email verification system is working!');
  } catch (error) {
    console.log('❌ Error sending verification email:');
    console.log('Code:', error.code);
    console.log('Message:', error.message);
  }
}

// Run the test
testEmailVerification().catch(console.error); 