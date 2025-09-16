#!/usr/bin/env node

/**
 * Incomplete Profile Reminder Script
 * 
 * This script finds artists who signed up 3+ days ago but haven't completed
 * their profile (missing bio or studio name) and sends them a reminder email.
 * 
 * Usage:
 *   node scripts/send-incomplete-profile-reminders.js
 * 
 * Environment Variables Required:
 *   - DATABASE_URL
 *   - SENDGRID_API_KEY (optional - will log instead of sending if not set)
 *   - FROM_EMAIL
 *   - NODE_ENV
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const emailService = require('../src/utils/emailService');

const prisma = new PrismaClient();

async function sendIncompleteProfileReminders() {
  console.log('🚀 Starting incomplete profile reminder process...');
  console.log('⏰ Current time:', new Date().toISOString());
  
  try {
    // Check if email service is configured
    if (!emailService.isConfigured()) {
      console.log('⚠️ Email service not configured. Running in dry-run mode.');
    }

    // Find artists who signed up 1+ days ago but haven't completed their profile
    // (Changed from 3 days to 1 day for testing with recent signups)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    console.log(`🔍 Looking for artists who signed up before: ${oneDayAgo.toISOString()}`);
    
    const incompleteProfiles = await prisma.user.findMany({
      where: {
        role: { in: ['ARTIST', 'ARTIST_ADMIN'] },
        createdAt: { lte: oneDayAgo },
        artistProfile: {
          AND: [
            {
              OR: [
                { bio: null },
                { bio: '' },
                { studioName: null },
                { studioName: '' }
              ]
            },
            {
              incompleteProfileReminderSentAt: null
            }
          ]
        }
      },
      include: {
        artistProfile: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📊 Found ${incompleteProfiles.length} artists with incomplete profiles`);

    if (incompleteProfiles.length === 0) {
      console.log('✅ No artists need reminder emails at this time.');
      return;
    }

    // Display artists who will receive reminders
    console.log('\n📋 Artists to receive reminders:');
    incompleteProfiles.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   - Signed up: ${user.createdAt.toISOString()}`);
      console.log(`   - Has bio: ${!!user.artistProfile?.bio}`);
      console.log(`   - Has studio: ${!!user.artistProfile?.studioName}`);
      console.log('');
    });

    const results = {
      total: incompleteProfiles.length,
      sent: 0,
      failed: 0,
      errors: []
    };

    // Send emails to each artist
    console.log('📧 Sending reminder emails...\n');
    
    for (const user of incompleteProfiles) {
      try {
        console.log(`📤 Sending reminder to ${user.email}...`);
        
        const emailResult = await emailService.sendIncompleteProfileReminderEmail(user);
        
        if (emailResult.success) {
          // Update the artist profile to mark reminder as sent
          await prisma.artistProfile.update({
            where: { userId: user.id },
            data: { incompleteProfileReminderSentAt: new Date() }
          });
          
          results.sent++;
          console.log(`✅ Reminder sent successfully to ${user.email}`);
        } else {
          results.failed++;
          results.errors.push({
            email: user.email,
            error: emailResult.error
          });
          console.log(`❌ Failed to send reminder to ${user.email}: ${emailResult.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: user.email,
          error: error.message
        });
        console.error(`❌ Error sending reminder to ${user.email}:`, error.message);
      }
      
      // Add a small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Total artists: ${results.total}`);
    console.log(`   Emails sent: ${results.sent}`);
    console.log(`   Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(error => {
        console.log(`   - ${error.email}: ${error.error}`);
      });
    }

    console.log('\n✅ Incomplete profile reminder process completed!');

  } catch (error) {
    console.error('❌ Error in incomplete profile reminder process:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  sendIncompleteProfileReminders()
    .then(() => {
      console.log('🎉 Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { sendIncompleteProfileReminders };
