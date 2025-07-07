const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
    this.logRequest = this.logRequest.bind(this);
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, data = {}) {
    return JSON.stringify({
      timestamp: this.getTimestamp(),
      level,
      message,
      ...data,
    });
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.logDir, filename);
    fs.appendFileSync(filePath, content + '\n');
  }

  info(message, data = {}) {
    const logMessage = this.formatMessage('INFO', message, data);
    console.log('ℹ️', message, data);
    this.writeToFile('info.log', logMessage);
  }

  success(message, data = {}) {
    const logMessage = this.formatMessage('SUCCESS', message, data);
    console.log('✅', message, data);
    this.writeToFile('success.log', logMessage);
  }

  warn(message, data = {}) {
    const logMessage = this.formatMessage('WARN', message, data);
    console.warn('⚠️', message, data);
    this.writeToFile('warn.log', logMessage);
  }

  error(message, data = {}) {
    const logMessage = this.formatMessage('ERROR', message, data);
    console.error('❌', message, data);
    this.writeToFile('error.log', logMessage);
  }

  debug(message, data = {}) {
    if (process.env.NODE_ENV !== 'production') {
      const logMessage = this.formatMessage('DEBUG', message, data);
      console.debug('🐛', message, data);
      this.writeToFile('debug.log', logMessage);
    }
  }

  // API request logging
  logRequest(req, res, next) {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logData = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?.userId || 'anonymous',
        userEmail: req.user?.email || 'anonymous',
      };

      if (res.statusCode >= 400) {
        this.error(`API Request Failed: ${req.method} ${req.url}`, logData);
      } else {
        this.info(`API Request: ${req.method} ${req.url}`, logData);
      }
    });

    next();
  }

  // Database operation logging
  logDatabaseOperation(operation, table, data = {}) {
    this.info(`Database ${operation}`, {
      operation,
      table,
      ...data,
    });
  }

  // Authentication logging
  logAuth(action, data = {}) {
    this.info(`Authentication ${action}`, {
      action,
      ...data,
    });
  }

  // Business logic logging
  logBusinessLogic(action, data = {}) {
    this.info(`Business Logic: ${action}`, {
      action,
      ...data,
    });
  }

  // Error logging with stack trace
  logError(error, context = {}) {
    this.error('Application Error', {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  // Performance logging
  logPerformance(operation, duration, data = {}) {
    this.info(`Performance: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      ...data,
    });
  }

  // Security logging
  logSecurity(event, data = {}) {
    this.warn(`Security Event: ${event}`, {
      event,
      ...data,
    });
  }
}

module.exports = new Logger();
