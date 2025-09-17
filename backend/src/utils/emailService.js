const sgMail = require('@sendgrid/mail')
const templateEmailService = require('./templateEmailService')

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
} else {
  console.warn('⚠️ SENDGRID_API_KEY not found. Email functionality will be disabled.')
}

class EmailService {
  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'violette@tattooedworld.org'
    this.fromName = 'Tattooed World'
    this.version = '2.0.0' // Version identifier for debugging
    
    console.log('📧 EmailService initialized:', {
      version: this.version,
      fromEmail: this.fromEmail,
      fromName: this.fromName,
      NODE_ENV: process.env.NODE_ENV,
      FRONTEND_URL: process.env.FRONTEND_URL
    });
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

  isConfigured() {
    const configured = !!process.env.SENDGRID_API_KEY;
    console.log('📧 Email service configuration check:', {
      hasSendGridKey: !!process.env.SENDGRID_API_KEY,
      fromEmail: this.fromEmail,
      fromName: this.fromName,
      configured
    });
    return configured;
  }

  // Email verification email
  async sendEmailVerificationEmail(user, verificationToken) {
    // Try DB-backed template first, then gracefully fallback to legacy content
    try {
      const result = await templateEmailService.sendEmailVerificationEmail(user, verificationToken)
      if (result && result.success) return result
    } catch (_) {}
    try {
      // Force the correct domain for production - same fix as password reset
      const frontendUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5173' 
        : 'https://tattooedworld.org'  // Force correct domain regardless of FRONTEND_URL env var
      
      const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`
      
      // Debug logging for URL construction
      console.log('📧 Email verification URL debug:', {
        NODE_ENV: process.env.NODE_ENV,
        FRONTEND_URL: process.env.FRONTEND_URL,
        calculatedFrontendUrl: frontendUrl,
        finalVerificationUrl: verificationUrl,
        hasOldUrl: frontendUrl.includes('onrender.com')
      });
      
      const subject = 'Verify Your Email - Tattooed World 🎨'
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Verify Your Email</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Complete your Tattooed World registration</p>
          </div>
          
          <div style="padding: 40px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${user.firstName}!</h2>
            
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
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">What happens next?</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>✅ Your account will be activated immediately</li>
                <li>🔍 You can start browsing tattoo artists</li>
                <li>⭐ Read reviews and view portfolios</li>
                <li>📅 Book consultations with your favorite artists</li>
                <li>💬 Leave reviews after your sessions</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This verification link will expire in 24 hours for security reasons. If you didn't create an account with us, 
              you can safely ignore this email.
            </p>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                <strong>Security Tip:</strong> Never share this verification link with anyone. 
                Our team will never ask for your verification link.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Welcome to the Tattooed World community!<br>
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
      console.error('Error in sendEmailVerificationEmail:', error)
      return { success: false, error: error.message }
    }
  }

  // Welcome email for verified users
  async sendWelcomeEmail(user) {
    // Try DB-backed template first, then gracefully fallback to legacy content
    try {
      const result = await templateEmailService.sendWelcomeEmail(user)
      if (result && result.success) return result
    } catch (_) {}
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
              <a href="${process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : 'https://tattooedworld.org'}/artists" 
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
    // Try DB-backed template first, then gracefully fallback to legacy content
    try {
      const result = await templateEmailService.sendArtistVerificationEmail(user, artistProfile)
      if (result && result.success) return result
    } catch (_) {}
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
                          <a href="${process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : 'https://tattooedworld.org'}/artists/${artistProfile.id}" 
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
    // Try DB-backed template first, then gracefully fallback to legacy content
    try {
      const result = await templateEmailService.sendPasswordResetEmail(user, resetToken)
      if (result && result.success) return result
    } catch (_) {}
    // Debug logging for environment variables
    console.log('🔍 Email Service Debug:')
    console.log('  NODE_ENV:', process.env.NODE_ENV)
    console.log('  FRONTEND_URL:', process.env.FRONTEND_URL)
    
    // Force the correct domain for production - temporary fix for environment variable override
    const frontendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173' 
      : 'https://tattooedworld.org'  // Force correct domain regardless of FRONTEND_URL env var
    
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`
    console.log('  Generated resetUrl:', resetUrl)
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
          <p>© 2025 Tattooed World. All rights reserved.</p>
          <p>This email was sent to ${user.email}</p>
        </div>
      </div>
    `

    return this.sendEmail(user.email, subject, htmlContent)
  }

  // New review notification
  async sendReviewNotification({ to, artistName, reviewerName, rating, title, comment }) {
    // Try DB-backed template first, then gracefully fallback to legacy content
    try {
      const result = await templateEmailService.sendReviewNotification({ to, artistName, reviewerName, rating, title, comment })
      if (result && result.success) return result
    } catch (_) {}
    const subject = 'New Review on Your Profile! ⭐'
    
    // Use the correct production URL
    const frontendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173' 
      : 'https://tattooedworld.org';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">New Review!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone left a review on your profile</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${artistName.split(' ')[0]},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You received a new review on your Tattooed World profile from ${reviewerName}!
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="font-size: 24px; margin-right: 10px;">
                ${'⭐'.repeat(rating)}
              </div>
              <span style="color: #333; font-weight: bold;">${rating}/5 stars</span>
            </div>
            ${title ? `<h3 style="color: #333; margin: 0 0 10px 0;">${title}</h3>` : ''}
            ${comment ? `<p style="color: #666; line-height: 1.6; margin: 0;">${comment}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${frontendUrl}/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Your Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Keep up the great work!<br>
            The Tattooed World Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2025 Tattooed World. All rights reserved.</p>
          <p>This email was sent to ${to}</p>
        </div>
      </div>
    `

    return this.sendEmail(to, subject, htmlContent)
  }

  // Booking confirmation email
  async sendBookingConfirmation(booking, artist, client) {
    // Try DB-backed template first, then gracefully fallback to legacy content
    try {
      const result = await templateEmailService.sendBookingConfirmation(booking, artist, client)
      if (result && result.success) return result
    } catch (_) {}
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
            <a href="${frontendUrl}/bookings/${booking.id}" 
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
          <p>© 2025 Tattooed World. All rights reserved.</p>
          <p>This email was sent to ${client.email}</p>
        </div>
      </div>
    `

    return this.sendEmail(client.email, subject, htmlContent)
  }

  // Artist to client email (for favorite clients)
  async sendArtistToClientEmail({ to, clientName, artistName, artistEmail, subject, message, studioName }) {
    // Try DB-backed template first, then gracefully fallback to legacy content
    try {
      const result = await templateEmailService.sendArtistToClientEmail({ to, clientName, artistName, artistEmail, subject, message, studioName })
      if (result && result.success) return result
    } catch (_) {}
    const emailSubject = subject || `Message from ${artistName} - Tattooed World`
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Message from ${artistName}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${studioName}</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${clientName},</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="color: #666; line-height: 1.6; margin: 0; font-style: italic;">
              "${message}"
            </p>
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Contact Information:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>🎨 Artist: ${artistName}</li>
              <li>🏢 Studio: ${studioName}</li>
              <li>📧 Email: ${artistEmail}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${artistEmail}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reply to ${artistName}
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Note:</strong> This message was sent through Tattooed World because you have ${artistName} in your favorites. 
              You can reply directly to this email to contact the artist.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            ${artistName}<br>
            ${studioName}
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2025 Tattooed World. All rights reserved.</p>
          <p>This email was sent to ${to}</p>
          <p>Sent via Tattooed World platform</p>
        </div>
      </div>
    `

    return this.sendEmail(to, emailSubject, htmlContent)
  }

  // Client to artist email
  async sendClientToArtistEmail({ to, artistName, clientName, clientEmail, clientPhone, subject, message, studioName }) {
    // Try DB-backed template first, then gracefully fallback to legacy content
    try {
      const result = await templateEmailService.sendClientToArtistEmail({ to, artistName, clientName, clientEmail, clientPhone, subject, message, studioName })
      if (result && result.success) return result
    } catch (_) {}
    const emailSubject = subject || `New message from ${clientName} - Tattooed World`
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">New Message from ${clientName}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${studioName}</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${artistName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You have received a new message from a potential client through Tattooed World.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="color: #666; line-height: 1.6; margin: 0; font-style: italic;">
              "${message}"
            </p>
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Client Information:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>👤 Name: ${clientName}</li>
              <li>📧 Email: ${clientEmail}</li>
              ${clientPhone ? `<li>📱 Phone: ${clientPhone}</li>` : ''}
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${clientEmail}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reply to ${clientName}
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Note:</strong> This message was sent through Tattooed World. 
              You can reply directly to this email to contact the client.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Tattooed World Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2025 Tattooed World. All rights reserved.</p>
          <p>This email was sent to ${to}</p>
          <p>Sent via Tattooed World platform</p>
        </div>
      </div>
    `

    return this.sendEmail(to, emailSubject, htmlContent)
  }

  // Client to studio email
  async sendClientToStudioEmail({ to, studioName, clientName, clientEmail, clientPhone, subject, message, studioAddress }) {
    // Try DB-backed template first, then gracefully fallback to legacy content
    try {
      const result = await templateEmailService.sendClientToStudioEmail({ to, studioName, clientName, clientEmail, clientPhone, subject, message, studioAddress })
      if (result && result.success) return result
    } catch (_) {}
    const emailSubject = subject || `New message from ${clientName} - Tattooed World`
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">New Message from ${clientName}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${studioName}</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${studioName} Team,</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You have received a new message from a potential client through Tattooed World.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="color: #666; line-height: 1.6; margin: 0; font-style: italic;">
              "${message}"
            </p>
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Client Information:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>👤 Name: ${clientName}</li>
              <li>📧 Email: ${clientEmail}</li>
              ${clientPhone ? `<li>📱 Phone: ${clientPhone}</li>` : ''}
            </ul>
          </div>
          
          ${studioAddress ? `
          <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Studio Location:</h3>
            <p style="color: #666; line-height: 1.6; margin: 0;">
              📍 ${studioAddress}
            </p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${clientEmail}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reply to ${clientName}
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Note:</strong> This message was sent through Tattooed World. 
              You can reply directly to this email to contact the client.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Tattooed World Team
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2025 Tattooed World. All rights reserved.</p>
          <p>This email was sent to ${to}</p>
          <p>Sent via Tattooed World platform</p>
        </div>
      </div>
    `

    return this.sendEmail(to, emailSubject, htmlContent)
  }

  // Send studio join request email to studio owners/managers
  async sendStudioJoinRequestEmail({ to, studioOwnerName, artistName, studioName, message, requestId }) {
    // Try DB-backed template first, then gracefully fallback to legacy content
    try {
      const result = await templateEmailService.sendStudioJoinRequestEmail({ to, studioOwnerName, artistName, studioName, message, requestId })
      if (result && result.success) return result
    } catch (_) {}
    try {
      const subjectLine = `Artist ${artistName} wants to join ${studioName}`
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Studio Join Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${studioName}</p>
          </div>
          
          <div style="padding: 40px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${studioOwnerName}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              An artist has requested to join <strong>${studioName}</strong>.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Artist Details:</h3>
              <p style="color: #666; line-height: 1.6; margin: 0;">
                <strong>Name:</strong> ${artistName}<br>
                <strong>Request ID:</strong> ${requestId}
              </p>
            </div>
            
            ${message ? `
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Message from Artist:</h3>
              <p style="color: #666; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            ` : ''}
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">Next Steps:</h3>
              <p style="color: #856404; line-height: 1.6; margin: 0;">
                Log into your Tattooed World account to review and approve/reject this request. 
                You can view all pending requests in your studio management dashboard.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for being part of the Tattooed World community!
            </p>
          </div>
        </div>
      `
      
      return await this.sendEmail(to, subjectLine, htmlContent)
    } catch (error) {
      console.error('Error sending studio join request email:', error)
      return { success: false, error: error.message }
    }
  }

  // Send studio join request response email to artist
  async sendStudioJoinRequestResponseEmail({ to, artistName, studioName, responderName, action, message }) {
    // Try DB-backed template first, then gracefully fallback to legacy content
    try {
      const result = await templateEmailService.sendStudioJoinRequestResponseEmail({ to, artistName, studioName, responderName, action, message })
      if (result && result.success) return result
    } catch (_) {}
    try {
      const subjectLine = `Your request to join ${studioName} has been ${action.toLowerCase()}d`
      const actionColor = action === 'APPROVE' ? '#28a745' : '#dc3545'
      const actionText = action === 'APPROVE' ? 'approved' : 'rejected'
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Studio Join Request ${action}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${studioName}</p>
          </div>
          
          <div style="padding: 40px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${artistName}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Your request to join <strong>${studioName}</strong> has been <span style="color: ${actionColor}; font-weight: bold;">${actionText}</span> by <strong>${responderName}</strong>.
            </p>
            
            ${action === 'APPROVE' ? `
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
              <h3 style="color: #155724; margin-top: 0;">🎉 Welcome to ${studioName}!</h3>
              <p style="color: #155724; line-height: 1.6; margin: 0;">
                You are now a member of the studio. You can update your profile to show your association with ${studioName} 
                and start collaborating with other artists in the studio.
              </p>
            </div>
            ` : `
            <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f5c6cb;">
              <h3 style="color: #721c24; margin-top: 0;">Request Not Approved</h3>
              <p style="color: #721c24; line-height: 1.6; margin: 0;">
                Unfortunately, your request to join ${studioName} was not approved at this time. 
                You can still work independently or apply to other studios.
              </p>
            </div>
            `}
            
            ${message ? `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Message from ${responderName}:</h3>
              <p style="color: #666; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            ` : ''}
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for being part of the Tattooed World community!
            </p>
          </div>
        </div>
      `
      
      return await this.sendEmail(to, subjectLine, htmlContent)
    } catch (error) {
      console.error('Error sending studio join request response email:', error)
      return { success: false, error: error.message }
    }
  }

  // Incomplete profile reminder email for artists
  async sendIncompleteProfileReminderEmail(user) {
    // Try DB-backed template first, then gracefully fallback to legacy content
    try {
      const result = await templateEmailService.sendIncompleteProfileReminderEmail(user)
      if (result && result.success) return result
    } catch (_) {}
    try {
      const subject = 'Your TattooedWorld profile isn\'t live yet'
      const frontendUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5173' 
        : 'https://tattooedworld.org'
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Complete Your Profile</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">TattooedWorld</p>
          </div>
          
          <div style="padding: 40px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Hey ${user.firstName},</h2>
            
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
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Want a complete profile? Go further:</h3>
              <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Add some of your work (healed tattoos, flash, etc.)</li>
                <li>Drop in your IG and other links</li>
                <li>Select your style and specialties</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/dashboard" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Complete Your Profile
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We built TattooedWorld to put artists on the map — literally. If you hit a snag or have ideas, reply to this email. 
              Your feedback helps us make it better for everyone.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Respect,<br>
              The TattooedWorld Team
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
            <p>© 2025 TattooedWorld. All rights reserved.</p>
            <p>This email was sent to ${user.email}</p>
          </div>
        </div>
      `

      return await this.sendEmail(user.email, subject, htmlContent)
    } catch (error) {
      console.error('Error in sendIncompleteProfileReminderEmail:', error)
      return { success: false, error: error.message }
    }
  }
}

module.exports = new EmailService() 