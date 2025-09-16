#!/usr/bin/env node

/**
 * Run Incomplete Profile Reminders from Render
 * 
 * This script is designed to be run from Render's console or via API call.
 * It will send reminder emails to artists with incomplete profiles.
 * 
 * Usage from Render:
 * 1. Go to Render Dashboard → Your Service → Shell
 * 2. Run: node scripts/run-reminders-from-render.js
 * 
 * Or via API call to: POST /api/admin/send-incomplete-profile-reminders
 */

require('dotenv').config();
const { sendIncompleteProfileReminders } = require('./send-incomplete-profile-reminders.js');

console.log('🚀 Starting incomplete profile reminders from Render...');
console.log('📧 FROM_EMAIL:', process.env.FROM_EMAIL);
console.log('🌐 FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('🔑 SENDGRID configured:', !!process.env.SENDGRID_API_KEY);

// Run the reminder process
sendIncompleteProfileReminders()
  .then(() => {
    console.log('✅ Reminder process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Reminder process failed:', error);
    process.exit(1);
  });
