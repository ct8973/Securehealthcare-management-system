// backend/common/logger.js
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['req.headers.authorization', 'password'], // keep secrets out of logs
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { singleLine: true } }
    : undefined,
});

module.exports = logger;
