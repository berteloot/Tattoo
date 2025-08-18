/**
 * Structured logging utility for production and development environments
 * Provides environment-based logging guards and structured output
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Structured logger with environment-based guards
 */
class Logger {
  constructor() {
    this.isDevelopment = isDevelopment;
  }

  /**
   * Development-only logging (never in production)
   */
  debug(message, data = null) {
    if (this.isDevelopment) {
      if (data) {
        console.log(`🔍 [DEBUG] ${message}`, data);
      } else {
        console.log(`🔍 [DEBUG] ${message}`);
      }
    }
  }

  /**
   * Development-only logging (never in production)
   */
  info(message, data = null) {
    if (this.isDevelopment) {
      if (data) {
        console.log(`ℹ️ [INFO] ${message}`, data);
      } else {
        console.log(`ℹ️ [INFO] ${message}`);
      }
    }
  }

  /**
   * Always logged (development and production)
   */
  warn(message, data = null) {
    if (data) {
      console.warn(`⚠️ [WARN] ${message}`, data);
    } else {
      console.warn(`⚠️ [WARN] ${message}`);
    }
  }

  /**
   * Always logged (development and production)
   */
  error(message, error = null) {
    if (error) {
      console.error(`❌ [ERROR] ${message}`, error);
    } else {
      console.error(`❌ [ERROR] ${message}`);
    }
  }

  /**
   * Success logging (development only)
   */
  success(message, data = null) {
    if (this.isDevelopment) {
      if (data) {
        console.log(`✅ [SUCCESS] ${message}`, data);
      } else {
        console.log(`✅ [SUCCESS] ${message}`);
      }
    }
  }

  /**
   * Request logging (development only)
   */
  request(method, path, ip, additionalInfo = {}) {
    if (this.isDevelopment) {
      const info = { method, path, ip, ...additionalInfo };
      console.log(`🔍 [REQUEST] ${method} ${path}`, info);
    }
  }

  /**
   * Request body logging (development only)
   */
  requestBody(message, body) {
    if (this.isDevelopment) {
      console.log(`📝 [REQUEST_BODY] ${message}`, body);
    }
  }

  /**
   * Auth logging (development only, no sensitive data)
   */
  auth(message, safeData = {}) {
    if (this.isDevelopment) {
      console.log(`🔐 [AUTH] ${message}`, safeData);
    }
  }

  /**
   * Geocoding logging (development only)
   */
  geocoding(message, data = null) {
    if (this.isDevelopment) {
      if (data) {
        console.log(`🌍 [GEOCODING] ${message}`, data);
      } else {
        console.log(`🌍 [GEOCODING] ${message}`);
      }
    }
  }

  /**
   * Database logging (development only)
   */
  database(message, data = null) {
    if (this.isDevelopment) {
      if (data) {
        console.log(`🗄️ [DB] ${message}`, data);
      } else {
        console.log(`🗄️ [DB] ${message}`);
      }
    }
  }
}

// Export singleton instance
const logger = new Logger();

module.exports = logger;
