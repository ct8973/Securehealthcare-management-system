// backend/common/requestId.js
const { randomUUID } = require('crypto');

module.exports = function requestId() {
  return (req, res, next) => {
    // Honor inbound ID (from gateway/NGINX) or create one
    const inbound = req.headers['x-request-id'];
    const id = typeof inbound === 'string' && inbound.trim() ? inbound.trim() : randomUUID();
    req.id = id;
    res.setHeader('x-request-id', id);
    next();
  };
};
