const rateLimit = require('express-rate-limit');

// Rate limiting for API endpoints to prevent scraping
const createScrapingLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for certain user agents (browsers)
    skip: (req) => {
      const userAgent = req.get('User-Agent') || '';
      const isBrowser = /chrome|firefox|safari|edge|opera/i.test(userAgent);
      const isBot = /bot|crawler|spider|scraper/i.test(userAgent);
      
      // Allow browsers, block obvious bots
      return isBrowser && !isBot;
    }
  });
};

// Specific limiter for studio and artist endpoints
const studioArtistLimiter = createScrapingLimiter(15 * 60 * 1000, 50);

// Limiter for contact information endpoints
const contactInfoLimiter = createScrapingLimiter(15 * 60 * 1000, 20);

// Middleware to detect and block common scraping patterns
const detectScraping = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const referer = req.get('Referer') || '';
  
  // Block obvious scraping tools
  const scrapingPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /scraping/i,
    /harvest/i,
    /collector/i,
    /extractor/i,
    /email.*harvest/i,
    /email.*collector/i,
    /email.*extractor/i
  ];
  
  const isScrapingTool = scrapingPatterns.some(pattern => pattern.test(userAgent));
  
  if (isScrapingTool) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }
  
  // Check for suspicious request patterns
  const suspiciousHeaders = [
    'X-Forwarded-For',
    'X-Real-IP',
    'CF-Connecting-IP'
  ];
  
  const hasMultipleIPs = suspiciousHeaders.some(header => {
    const value = req.get(header);
    return value && value.includes(',');
  });
  
  if (hasMultipleIPs) {
    console.log('Suspicious request detected:', {
      ip: req.ip,
      userAgent,
      headers: suspiciousHeaders.map(h => req.get(h))
    });
  }
  
  next();
};

// Middleware to add security headers
const addSecurityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://maps.googleapis.com;");
  
  next();
};

module.exports = {
  createScrapingLimiter,
  studioArtistLimiter,
  contactInfoLimiter,
  detectScraping,
  addSecurityHeaders
};
