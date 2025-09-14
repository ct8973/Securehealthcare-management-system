const AuditLog = require('../audit-log/model');
const mongoose = require('mongoose');

exports.audit = async function audit({
  req,
  action,         // 'create' | 'update' | 'delete'
  resource,       // 'patient' | 'appointment' | 'user' | ...
  resourceId,     // string or ObjectId
  before = null,
  after = null,
}) {
  try {
    await AuditLog.create({
      actorUserId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : null,
      actorRole: req.user?.role || null,
      action, resource,
      resourceId: resourceId ? new mongoose.Types.ObjectId(resourceId) : null,
      before, after,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  } catch (e) {
    // Don’t crash business flow on audit failure; just log to console
    console.error('Audit log failed:', e.message);
  }
};
