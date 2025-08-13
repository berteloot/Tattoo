// Content filtering and spam detection utilities
const contentFilter = {
  // Common spam words and phrases
  spamWords: [
    'buy now', 'click here', 'free money', 'make money fast', 'work from home',
    'earn money', 'get rich', 'investment opportunity', 'lottery winner',
    'viagra', 'cialis', 'weight loss', 'diet pills', 'casino', 'poker',
    'crypto', 'bitcoin', 'forex', 'trading', 'investment', 'loan',
    'credit repair', 'debt consolidation', 'payday loan', 'refinance',
    'seo services', 'marketing services', 'social media marketing',
    'increase followers', 'buy followers', 'buy likes'
  ],
  
  // Inappropriate content patterns
  inappropriatePatterns: [
    /\b(fuck|shit|bitch|asshole|dick|pussy)\b/i,
    /\b(kill|murder|suicide|bomb|terrorist)\b/i,
    /\b(nazi|hitler|genocide)\b/i,
    /\b(rape|molest|abuse)\b/i
  ],
  
  // Disposable email domains to block
  disposableEmailDomains: [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
    'yopmail.com', 'temp-mail.org', 'throwaway.email', 'getnada.com',
    'maildrop.cc', 'sharklasers.com', 'trashmail.com', 'mohmal.com'
  ],
  
  // Check for spam content
  isSpam: (text) => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return contentFilter.spamWords.some(word => lowerText.includes(word));
  },
  
  // Check for inappropriate content
  isInappropriate: (text) => {
    if (!text) return false;
    return contentFilter.inappropriatePatterns.some(pattern => pattern.test(text));
  },
  
  // Check for excessive caps (shouting)
  isShouting: (text) => {
    if (!text) return false;
    const upperCount = (text.match(/[A-Z]/g) || []).length;
    const totalLetters = (text.match(/[A-Za-z]/g) || []).length;
    return totalLetters > 10 && (upperCount / totalLetters) > 0.7;
  },
  
  // Check for repetitive characters
  isRepetitive: (text) => {
    if (!text) return false;
    return /(.)\1{4,}/.test(text); // Same character repeated 5+ times
  },
  
  // Check if email domain is disposable
  isDisposableEmail: (email) => {
    if (!email) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return contentFilter.disposableEmailDomains.includes(domain);
  },
  
  // Comprehensive content check
  checkContent: (text) => {
    if (!text) return { isValid: true };
    
    const issues = [];
    
    if (contentFilter.isSpam(text)) {
      issues.push('contains spam content');
    }
    
    if (contentFilter.isInappropriate(text)) {
      issues.push('contains inappropriate content');
    }
    
    if (contentFilter.isShouting(text)) {
      issues.push('contains excessive capitalization');
    }
    
    if (contentFilter.isRepetitive(text)) {
      issues.push('contains repetitive characters');
    }
    
    return {
      isValid: issues.length === 0,
      issues: issues
    };
  }
};

module.exports = contentFilter;
