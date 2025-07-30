const sgMail = require('@sendgrid/mail')

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
} else {
  console.warn('⚠️ SENDGRID_API_KEY not found. Email functionality will be disabled.')
}

class EmailService {
  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@tattoolocator.com'
    this.fromName = 'Tattooed World'
  }

  async sendEmail(to, subject, htmlContent, textContent = '') {
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 Email not sent - SendGrid not configured:', { to, subject })
      return { success: false, error: 'Email service not configured' }
    }

    try {
      const msg = {
        to,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject,
        html: htmlContent,
        text: textContent || this.stripHtml(htmlContent)
      }

      const response = await sgMail.send(msg)
      console.log('Email sent successfully:', response[0].statusCode)
      return { success: true, messageId: response[0].headers['x-message-id'] }
    } catch (error) {
      console.error('Error sending email:', error)
      // Don't throw the error, just return failure
      return { success: false, error: error.message }
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '')
  }

  // Welcome email for new users
  async sendWelcomeEmail(user) {
    try {
      const subject = 'Welcome to Tattooed World! 🎨'
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Tattooed World!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your journey to finding the perfect tattoo artist starts here</p>
          </div>
          
          <div style="padding: 40px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${user.firstName}!</h2>
            
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
              <a href="${process.env.FRONTEND_URL || 'https://tattoo-app-frontend.onrender.com'}/artists" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Start Exploring Artists
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions or need help finding the right artist, don't hesitate to reach out to our support team.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Happy inking!<br>
              The Tattooed World Team
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
            <p>© 2025 Tattooed World. All rights reserved.</p>
            <p>This email was sent to ${user.email}</p>
          </div>
        </div>
      `

      return await this.sendEmail(user.email, subject, htmlContent)
    } catch (error) {
      console.error('Error in sendWelcomeEmail:', error)
      return { success: false, error: error.message }
    }
  }

  // Artist profile verification email
  async sendArtistVerificationEmail(user, artistProfile) {
    const subject = 'Your Artist Profile is Live! 🎨'
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Tattooed World!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your artist profile is now live and ready to attract clients</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Congratulations, ${user.firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your artist profile for <strong>${artistProfile.studioName}</strong> has been verified and is now live on Tattooed World!
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Profile Details:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>📍 Location: ${artistProfile.city}, ${artistProfile.state}</li>
              <li>💰 Hourly Rate: $${artistProfile.hourlyRate}/hr</li>
              <li>🎨 Specialties: ${artistProfile.specialties?.map(s => s.name).join(', ') || 'Not specified'}</li>
              <li>✅ Status: Verified Artist</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://tattoo-app-frontend.onrender.com'}/artists/${artistProfile.id}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Your Profile
            </a>
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Next Steps:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>📸 Upload your best work to your portfolio</li>
              <li>💬 Respond to client inquiries promptly</li>
              <li>⭐ Encourage satisfied clients to leave reviews</li>
              <li>📅 Keep your availability updated</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Welcome to the Tattooed World community!<br>
            The Tattooed World Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2025 Tattoo Locator. All rights reserved.</p>
          <p>This email was sent to ${user.email}</p>
        </div>
      </div>
    `

    return this.sendEmail(user.email, subject, htmlContent)
  }

  // Password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'https://tattoo-app-frontend.onrender.com'}/reset-password?token=${resetToken}`
    const subject = 'Reset Your Password - Tattooed World'
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Tattooed World</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${user.firstName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your Tattooed World account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This link will expire in 1 hour for security reasons. If you didn't request this password reset, 
            you can safely ignore this email.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              <strong>Security Tip:</strong> Never share your password or this reset link with anyone. 
              Our team will never ask for your password.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Tattooed World Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2025 Tattoo Locator. All rights reserved.</p>
          <p>This email was sent to ${user.email}</p>
        </div>
      </div>
    `

    return this.sendEmail(user.email, subject, htmlContent)
  }

  // New review notification
  async sendReviewNotification(artist, review) {
    const subject = 'New Review on Your Profile! ⭐'
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">New Review!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone left a review on your profile</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${artist.user.firstName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You received a new review on your Tattooed World profile!
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="font-size: 24px; margin-right: 10px;">
                ${'⭐'.repeat(review.rating)}
              </div>
              <span style="color: #333; font-weight: bold;">${review.rating}/5 stars</span>
            </div>
            <h3 style="color: #333; margin: 0 0 10px 0;">${review.title}</h3>
            <p style="color: #666; line-height: 1.6; margin: 0;">${review.comment}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://tattoo-app-frontend.onrender.com'}/artists/${artist.id}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Your Profile
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Keep up the great work!<br>
            The Tattooed World Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2025 Tattoo Locator. All rights reserved.</p>
          <p>This email was sent to ${artist.user.email}</p>
        </div>
      </div>
    `

    return this.sendEmail(artist.user.email, subject, htmlContent)
  }

  // Booking confirmation email
  async sendBookingConfirmation(booking, artist, client) {
    const subject = 'Booking Confirmation - Tattoo Session'
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Booking Confirmed!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your tattoo session is scheduled</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${client.firstName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your tattoo session with ${artist.user.firstName} ${artist.user.lastName} has been confirmed!
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Booking Details:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>🎨 Artist: ${artist.user.firstName} ${artist.user.lastName}</li>
              <li>🏢 Studio: ${artist.studioName}</li>
              <li>📅 Date: ${new Date(booking.date).toLocaleDateString()}</li>
              <li>⏰ Time: ${booking.time}</li>
              <li>💰 Estimated Cost: $${booking.estimatedCost}</li>
            </ul>
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Important Reminders:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>🚫 Avoid alcohol 24 hours before your session</li>
              <li>💤 Get a good night's sleep</li>
              <li>🍽️ Eat a good meal before your appointment</li>
              <li>👕 Wear comfortable clothing</li>
              <li>📱 Bring your ID and any reference images</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://tattoo-app-frontend.onrender.com'}/bookings/${booking.id}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Booking Details
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            We're excited for your tattoo session!<br>
            The Tattooed World Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2025 Tattoo Locator. All rights reserved.</p>
          <p>This email was sent to ${client.email}</p>
        </div>
      </div>
    `

    return this.sendEmail(client.email, subject, htmlContent)
  }
}

module.exports = new EmailService() 