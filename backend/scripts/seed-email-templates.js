#!/usr/bin/env node

/**
 * Seed Email Templates Script
 * 
 * This script creates default email templates in the database.
 * Run this after setting up the email templates table.
 * 
 * Usage:
 *   node scripts/seed-email-templates.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultTemplates = [
  {
    name: 'Email Verification',
    type: 'EMAIL_VERIFICATION',
    subject: 'Verify Your Email - Tattooed World 🎨',
    description: 'Email sent to new users to verify their email address',
    variables: ['firstName', 'verificationUrl'],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Verify Your Email</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Complete your Tattooed World registration</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi {{firstName}}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for joining Tattooed World! To complete your registration and start exploring amazing tattoo artists, 
            please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{verificationUrl}}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This verification link will expire in 24 hours for security reasons. If you didn't create an account with us, 
            you can safely ignore this email.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Welcome to the Tattooed World community!<br>
            The Tattooed World Team
          </p>
        </div>
      </div>
    `,
    textContent: `Hi {{firstName}}! Thank you for joining Tattooed World! Please verify your email by clicking this link: {{verificationUrl}}`
  },
  {
    name: 'Incomplete Profile Reminder',
    type: 'INCOMPLETE_PROFILE_REMINDER',
    subject: 'Your TattooedWorld profile isn\'t live yet',
    description: 'Reminder email for artists who haven\'t completed their profile',
    variables: ['firstName', 'dashboardUrl'],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Complete Your Profile</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">TattooedWorld</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hey {{firstName}},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thanks for signing up with TattooedWorld. Right now, you're in the system — but your artist profile isn't visible yet.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">At the minimum, you only need 2 quick steps to get listed as an artist:</h3>
            <ol style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Go to your <strong>Dashboard</strong> (top right).</li>
              <li>In <strong>Basic Info</strong>, write a short bio (10 characters or more) and search for your studio. If you're the owner, click <strong>Claim</strong>.</li>
            </ol>
            <p style="color: #333; margin: 15px 0 0 0; font-weight: bold;">That's it — you'll show up on the map as an artist.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Complete Your Profile
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            We built TattooedWorld to put artists on the map — literally. If you hit a snag or have ideas, reply to this email. 
            Your feedback helps us make it better for everyone.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Respect,<br>
            The TattooedWorld Team
          </p>
        </div>
      </div>
    `,
    textContent: `Hey {{firstName}}, thanks for signing up with TattooedWorld. Your artist profile isn't visible yet. Complete it at: {{dashboardUrl}}`
  },
  {
    name: 'Welcome Email',
    type: 'WELCOME',
    subject: 'Welcome to Tattooed World! 🎨',
    description: 'Welcome email sent after successful email verification',
    variables: ['firstName', 'dashboardUrl'],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Tattooed World!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your journey to finding the perfect tattoo artist starts here</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi {{firstName}}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for joining Tattooed World! We're excited to help you connect with amazing tattoo artists in Montreal.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>🔍 Browse artists by specialty and location</li>
              <li>⭐ Read reviews and view portfolios</li>
              <li>📅 Book consultations with your favorite artists</li>
              <li>💬 Leave reviews after your sessions</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Exploring Artists
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Happy inking!<br>
            The Tattooed World Team
          </p>
        </div>
      </div>
    `,
    textContent: `Hi {{firstName}}! Welcome to Tattooed World! Start exploring artists at: {{dashboardUrl}}`
  },
  {
    name: 'Password Reset',
    type: 'PASSWORD_RESET',
    subject: 'Reset Your Password - Tattooed World',
    description: 'Password reset email with secure reset link',
    variables: ['firstName', 'resetUrl'],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Tattooed World</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi {{firstName}},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your Tattooed World account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetUrl}}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This link will expire in 1 hour for security reasons. If you didn't request this password reset, 
            you can safely ignore this email.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Tattooed World Team
          </p>
        </div>
      </div>
    `,
    textContent: `Hi {{firstName}}, reset your password at: {{resetUrl}} (expires in 1 hour)`
  }
];

async function seedEmailTemplates() {
  console.log('🌱 Starting email templates seed...');
  
  try {
    // Check if templates already exist
    const existingTemplates = await prisma.emailTemplate.count();
    
    if (existingTemplates > 0) {
      console.log(`📧 Found ${existingTemplates} existing templates. Skipping seed.`);
      return;
    }

    console.log('📧 Creating default email templates...');

    for (const template of defaultTemplates) {
      try {
        await prisma.emailTemplate.create({
          data: template
        });
        console.log(`✅ Created template: ${template.name}`);
      } catch (error) {
        console.error(`❌ Failed to create template ${template.name}:`, error.message);
      }
    }

    console.log('🎉 Email templates seed completed!');

  } catch (error) {
    console.error('❌ Error seeding email templates:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedEmailTemplates();
}

module.exports = { seedEmailTemplates };
