#!/usr/bin/env node

/**
 * Test Email Service Configuration
 * Run this script to verify email service is working properly
 */

require('dotenv').config();
const { EmailService } = require('../src/utils/emailService');

async function testEmailService() {
  console.log('🧪 Testing Email Service Configuration...\n');
  
  const emailService = new EmailService();
  
  // Check configuration
  console.log('📧 Email Service Configuration:');
  console.log('- SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('- FROM_EMAIL:', process.env.FROM_EMAIL || 'stan@berteloot.org');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);
  console.log('- isConfigured():', emailService.isConfigured());
  
  if (!emailService.isConfigured()) {
    console.log('\n❌ Email service is not configured. Please set SENDGRID_API_KEY in your environment.');
    return;
  }
  
  // Test review notification email
  console.log('\n🧪 Testing Review Notification Email...');
  
  try {
    const testData = {
      to: 'test@example.com', // Change this to a real email for testing
      artistName: 'Test Artist',
      reviewerName: 'Test Reviewer',
      rating: 5,
      title: 'Amazing work!',
      comment: 'This is a test review to verify the email service is working properly.'
    };
    
    console.log('📤 Sending test review notification...');
    const result = await emailService.sendReviewNotification(testData);
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('- Message ID:', result.messageId);
    } else {
      console.log('❌ Test email failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing email service:', error);
  }
  
  console.log('\n🏁 Email service test completed.');
}

// Run the test
testEmailService().catch(console.error);
