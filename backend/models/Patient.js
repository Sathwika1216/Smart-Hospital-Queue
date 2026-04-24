const mongoose = require('mongoose');

/**
 * Stages a patient moves through in the hospital flow.
 * - registration: intake / front desk
 * - doctor: consultation
 * - completed: finished (kept for status tracking)
 */
const STAGES = ['registration', 'doctor', 'completed'];

/**
 * Queue lifecycle within a stage.
 * - waiting: in line
 * - serving: currently being attended (after /next)
 * - completed: done with this stage (used only for final exit)
 */
const STATUSES = ['waiting', 'serving', 'completed'];

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    age: { type: Number, required: true, min: 0, max: 150 },
    issue: { type: String, required: true, trim: true, maxlength: 2000 },
    isEmergency: { type: Boolean, default: false },
    isRemote: { type: Boolean, default: false },
    /** Human-readable queue token shown to the patient */
    token: { type: String, required: true, unique: true, index: true },
    stage: {
      type: String,
      enum: STAGES,
      default: 'registration',
      index: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'waiting',
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

/** Compound index for queue queries: stage + status, sorted by priority then FIFO */
patientSchema.index({ stage: 1, status: 1, isEmergency: -1, createdAt: 1 });

module.exports = {
  Patient: mongoose.model('Patient', patientSchema),
  STAGES,
  STATUSES,
  /** Active queue stages (excludes terminal `completed` stage for queue listings) */
  QUEUE_STAGES: ['registration', 'doctor'],
};
