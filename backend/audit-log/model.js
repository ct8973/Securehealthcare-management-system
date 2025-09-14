const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema(
  {
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    actorRole: { type: String },
    action: { type: String, required: true },      // create|update|delete
    resource: { type: String, required: true },    // patient|appointment|user|...
    resourceId: { type: mongoose.Schema.Types.ObjectId, index: true },
    before: { type: Object },
    after: { type: Object },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', AuditSchema);
