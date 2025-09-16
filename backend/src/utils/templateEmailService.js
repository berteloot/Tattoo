const sgMail = require('@sendgrid/mail')
const { prisma } = require('./prisma')

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
} else {
  console.warn('⚠️ SENDGRID_API_KEY not found. Email functionality will be disabled.')
}

class TemplateEmailService {
  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'violette@tattooedworld.org'
    this.fromName = 'Tattooed World'
    this.version = '2.0.0'
    
    console.log('📧 TemplateEmailService initialized:', {
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

  // Get template from database
  async getTemplate(type) {
    try {
      const template = await prisma.emailTemplate.findFirst({
        where: {
          type: type,
          isActive: true
        }
      });

      if (!template) {
        console.warn(`⚠️ No active template found for type: ${type}`);
        return null;
      }

      return template;
    } catch (error) {
      console.error('Error fetching email template:', error);
      return null;
    }
  }

  // Replace variables in template content
  replaceVariables(content, variables) {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value || '');
    });
    return result;
  }

  // Send email using database template
  async sendTemplateEmail(type, to, variables = {}) {
    try {
      const template = await this.getTemplate(type);
      
      if (!template) {
        return { success: false, error: `No template found for type: ${type}` };
      }

      // Replace variables in subject and content
      const subject = this.replaceVariables(template.subject, variables);
      const htmlContent = this.replaceVariables(template.htmlContent, variables);
      const textContent = template.textContent 
        ? this.replaceVariables(template.textContent, variables)
        : this.stripHtml(htmlContent);

      // Send the email
      const result = await this.sendEmail(to, subject, htmlContent, textContent);
      
      if (result.success) {
        console.log(`📧 Template email sent successfully: ${type} to ${to}`);
      }

      return result;
    } catch (error) {
      console.error(`Error sending template email (${type}):`, error);
      return { success: false, error: error.message };
    }
  }

  // Email verification email using template
  async sendEmailVerificationEmail(user, verificationToken) {
    const frontendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173' 
      : 'https://tattooedworld.org'
    
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    return await this.sendTemplateEmail('EMAIL_VERIFICATION', user.email, {
      firstName: user.firstName,
      verificationUrl: verificationUrl
    });
  }

  // Welcome email using template
  async sendWelcomeEmail(user) {
    const frontendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173' 
      : 'https://tattooedworld.org'
    
    return await this.sendTemplateEmail('WELCOME', user.email, {
      firstName: user.firstName,
      dashboardUrl: `${frontendUrl}/dashboard`
    });
  }

  // Incomplete profile reminder using template
  async sendIncompleteProfileReminderEmail(user) {
    const frontendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173' 
      : 'https://tattooedworld.org'
    
    return await this.sendTemplateEmail('INCOMPLETE_PROFILE_REMINDER', user.email, {
      firstName: user.firstName,
      dashboardUrl: `${frontendUrl}/dashboard`
    });
  }

  // Password reset email using template
  async sendPasswordResetEmail(user, resetToken) {
    const frontendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173' 
      : 'https://tattooedworld.org'
    
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    return await this.sendTemplateEmail('PASSWORD_RESET', user.email, {
      firstName: user.firstName,
      resetUrl: resetUrl
    });
  }

  // Artist verification email using template
  async sendArtistVerificationEmail(user, artistProfile) {
    const frontendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173' 
      : 'https://tattooedworld.org'
    
    return await this.sendTemplateEmail('ARTIST_VERIFICATION', user.email, {
      firstName: user.firstName,
      studioName: artistProfile.studioName,
      city: artistProfile.city,
      state: artistProfile.state,
      hourlyRate: artistProfile.hourlyRate,
      specialties: artistProfile.specialties?.map(s => s.name).join(', ') || 'Not specified',
      profileUrl: `${frontendUrl}/artists/${artistProfile.id}`
    });
  }

  // Review notification using template
  async sendReviewNotification({ to, artistName, reviewerName, rating, title, comment }) {
    const frontendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173' 
      : 'https://tattooedworld.org'
    
    return await this.sendTemplateEmail('REVIEW_NOTIFICATION', to, {
      artistName: artistName,
      reviewerName: reviewerName,
      rating: rating,
      title: title || '',
      comment: comment || '',
      dashboardUrl: `${frontendUrl}/dashboard`
    });
  }

  // Booking confirmation using template
  async sendBookingConfirmation(booking, artist, client) {
    const frontendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173' 
      : 'https://tattooedworld.org'
    
    return await this.sendTemplateEmail('BOOKING_CONFIRMATION', client.email, {
      firstName: client.firstName,
      artistName: `${artist.user.firstName} ${artist.user.lastName}`,
      studioName: artist.studioName,
      date: new Date(booking.date).toLocaleDateString(),
      time: booking.time,
      estimatedCost: booking.estimatedCost,
      bookingUrl: `${frontendUrl}/bookings/${booking.id}`
    });
  }

  // Artist to client email using template
  async sendArtistToClientEmail({ to, clientName, artistName, artistEmail, subject, message, studioName }) {
    return await this.sendTemplateEmail('ARTIST_TO_CLIENT', to, {
      clientName: clientName,
      artistName: artistName,
      artistEmail: artistEmail,
      subject: subject || `Message from ${artistName}`,
      message: message,
      studioName: studioName
    });
  }

  // Client to artist email using template
  async sendClientToArtistEmail({ to, artistName, clientName, clientEmail, clientPhone, subject, message, studioName }) {
    return await this.sendTemplateEmail('CLIENT_TO_ARTIST', to, {
      artistName: artistName,
      clientName: clientName,
      clientEmail: clientEmail,
      clientPhone: clientPhone || '',
      subject: subject || `New message from ${clientName}`,
      message: message,
      studioName: studioName
    });
  }

  // Client to studio email using template
  async sendClientToStudioEmail({ to, studioName, clientName, clientEmail, clientPhone, subject, message, studioAddress }) {
    return await this.sendTemplateEmail('CLIENT_TO_STUDIO', to, {
      studioName: studioName,
      clientName: clientName,
      clientEmail: clientEmail,
      clientPhone: clientPhone || '',
      subject: subject || `New message from ${clientName}`,
      message: message,
      studioAddress: studioAddress || ''
    });
  }

  // Studio join request email using template
  async sendStudioJoinRequestEmail({ to, studioOwnerName, artistName, studioName, message, requestId }) {
    return await this.sendTemplateEmail('STUDIO_JOIN_REQUEST', to, {
      studioOwnerName: studioOwnerName,
      artistName: artistName,
      studioName: studioName,
      message: message || '',
      requestId: requestId
    });
  }

  // Studio join request response email using template
  async sendStudioJoinRequestResponseEmail({ to, artistName, studioName, responderName, action, message }) {
    return await this.sendTemplateEmail('STUDIO_JOIN_RESPONSE', to, {
      artistName: artistName,
      studioName: studioName,
      responderName: responderName,
      action: action,
      actionText: action === 'APPROVE' ? 'approved' : 'rejected',
      message: message || ''
    });
  }
}

module.exports = new TemplateEmailService()
