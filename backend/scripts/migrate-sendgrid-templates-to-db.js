#!/usr/bin/env node

// Migrates existing hard-coded SendGrid email templates into email_templates table

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🚚 Migrating SendGrid templates into email_templates...')

  const templatesToUpsert = [
    {
      name: 'Email Verification',
      type: 'EMAIL_VERIFICATION',
      subject: 'Verify Your Email - Tattooed World 🎨',
      description: 'Email sent to new users to verify their email address',
      variables: ['firstName', 'verificationUrl'],
      htmlContent: '<div>Hi {{firstName}}, verify here: {{verificationUrl}}</div>',
    },
    {
      name: 'Welcome Email',
      type: 'WELCOME',
      subject: 'Welcome to Tattooed World! 🎨',
      description: 'Welcome email sent after successful email verification',
      variables: ['firstName', 'dashboardUrl'],
      htmlContent: '<div>Welcome {{firstName}} — go to {{dashboardUrl}}</div>',
    },
    {
      name: 'Password Reset',
      type: 'PASSWORD_RESET',
      subject: 'Reset Your Password - Tattooed World',
      description: 'Password reset email with secure reset link',
      variables: ['firstName', 'resetUrl'],
      htmlContent: '<div>Hi {{firstName}}, reset here: {{resetUrl}}</div>',
    },
    {
      name: 'Artist Verification',
      type: 'ARTIST_VERIFICATION',
      subject: 'Your Artist Profile is Live! 🎨',
      description: 'Artist profile has been verified and is live',
      variables: ['firstName','studioName','city','state','hourlyRate','specialties','profileUrl'],
      htmlContent: '<div>Congrats {{firstName}}, your profile at {{studioName}} is live. View: {{profileUrl}}</div>',
    },
    {
      name: 'Review Notification',
      type: 'REVIEW_NOTIFICATION',
      subject: 'New Review on Your Profile! ⭐',
      description: 'Notify artists when they receive a new review',
      variables: ['artistName','reviewerName','rating','title','comment','dashboardUrl'],
      htmlContent: '<div>{{artistName}}, new review from {{reviewerName}} ({{rating}}/5). {{title}} {{comment}}. Dashboard: {{dashboardUrl}}</div>',
    },
    {
      name: 'Booking Confirmation',
      type: 'BOOKING_CONFIRMATION',
      subject: 'Booking Confirmation - Tattoo Session',
      description: 'Confirmation email for client bookings',
      variables: ['firstName','artistName','studioName','date','time','estimatedCost','bookingUrl'],
      htmlContent: '<div>Hi {{firstName}}, your booking with {{artistName}} at {{studioName}} on {{date}} {{time}}. Cost: {{estimatedCost}}. Details: {{bookingUrl}}</div>',
    },
    {
      name: 'Artist to Client',
      type: 'ARTIST_TO_CLIENT',
      subject: 'Message from {{artistName}} - Tattooed World',
      description: 'Artist sends a message to a favorite client',
      variables: ['clientName','artistName','artistEmail','subject','message','studioName'],
      htmlContent: '<div>Hi {{clientName}}, message from {{artistName}} ({{studioName}}): {{message}}. Reply: {{artistEmail}}</div>',
    },
    {
      name: 'Client to Artist',
      type: 'CLIENT_TO_ARTIST',
      subject: 'New message from {{clientName}} - Tattooed World',
      description: 'Client sends a message to an artist',
      variables: ['artistName','clientName','clientEmail','clientPhone','subject','message','studioName'],
      htmlContent: '<div>Hi {{artistName}}, {{clientName}} wrote: {{message}} (email: {{clientEmail}} {{clientPhone}})</div>',
    },
    {
      name: 'Client to Studio',
      type: 'CLIENT_TO_STUDIO',
      subject: 'New message from {{clientName}} - Tattooed World',
      description: 'Client sends a message to a studio',
      variables: ['studioName','clientName','clientEmail','clientPhone','subject','message','studioAddress'],
      htmlContent: '<div>Hi {{studioName}} team, {{clientName}} wrote: {{message}} (email: {{clientEmail}} {{clientPhone}}) {{studioAddress}}</div>',
    },
    {
      name: 'Studio Join Request',
      type: 'STUDIO_JOIN_REQUEST',
      subject: 'Artist {{artistName}} wants to join {{studioName}}',
      description: 'Email sent to studio owners when an artist requests to join',
      variables: ['studioOwnerName','artistName','studioName','message','requestId'],
      htmlContent: '<div>Hi {{studioOwnerName}}, {{artistName}} wants to join {{studioName}}. Request: {{requestId}}. Message: {{message}}</div>',
    },
    {
      name: 'Studio Join Response',
      type: 'STUDIO_JOIN_RESPONSE',
      subject: 'Your request to join {{studioName}} has been {{actionText}}',
      description: 'Response email to artist for join request',
      variables: ['artistName','studioName','responderName','action','actionText','message'],
      htmlContent: '<div>Hi {{artistName}}, your request for {{studioName}} was {{actionText}} by {{responderName}}. {{message}}</div>',
    },
  ]

  let created = 0
  for (const t of templatesToUpsert) {
    try {
      await prisma.emailTemplate.upsert({
        where: { name: t.name },
        update: {
          type: t.type,
          subject: t.subject,
          htmlContent: t.htmlContent,
          variables: t.variables,
          description: t.description,
          isActive: true,
        },
        create: {
          name: t.name,
          type: t.type,
          subject: t.subject,
          htmlContent: t.htmlContent,
          variables: t.variables,
          description: t.description,
          isActive: true,
        },
      })
      created++
      console.log(`✅ Upserted: ${t.name}`)
    } catch (e) {
      console.error(`❌ Failed upsert ${t.name}:`, e.message)
    }
  }

  console.log(`🎉 Migration complete. Upserted ${created} templates.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


