const express = require('express');
const { Patient } = require('../models/Patient');
const { generateToken } = require('../utils/token');
const {
  registerValidators,
  stageParamValidators,
  idParamValidators,
} = require('../middleware/validate');

const router = express.Router();

/**
 * POST /register
 * Creates a patient at the registration stage with a unique queue token.
 */
router.post('/register', registerValidators, async (req, res) => {
  try {
    const { name, age, issue, isEmergency = false, isRemote = false } = req.body;

    // Retry a few times on rare token collision
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const token = generateToken();
      try {
        const patient = await Patient.create({
          name,
          age,
          issue,
          isEmergency,
          isRemote,
          token,
          stage: 'registration',
          status: 'waiting',
        });
        return res.status(201).json(patient);
      } catch (err) {
        if (err && err.code === 11000) continue;
        throw err;
      }
    }
    return res.status(503).json({ error: 'Could not assign a unique token, try again.' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: 'Registration failed.' });
  }
});

/**
 * GET /queue/:stage
 * Returns patients in the waiting queue for a stage, ordered by:
 * emergency first, then oldest registration first (FIFO).
 */
router.get('/queue/:stage', stageParamValidators, async (req, res) => {
  try {
    const { stage } = req.params;
    const patients = await Patient.find({ stage, status: 'waiting' })
      .sort({ isEmergency: -1, createdAt: 1 })
      .lean();
    return res.json({ stage, count: patients.length, patients });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: 'Could not load queue.' });
  }
});

/**
 * PUT /next/:stage
 * Marks the next waiting patient as "serving" for that stage (staff calls them).
 * Priority: emergencies first, then FIFO by createdAt.
 */
router.put('/next/:stage', stageParamValidators, async (req, res) => {
  try {
    const all = await Patient.find({});
console.log("ALL PATIENTS:", all);
    const { stage } = req.params;

    const searchStage = stage === 'doctor' ? 'registration' : stage;
    console.log("👉 CALL NEXT HIT:", req.params.stage);
   
    

    const next = await Patient.findOneAndUpdate(
      { stage: searchStage, status: 'waiting' },
      { $set: { status: 'serving', stage: stage } }, // ← this line was missing before
      { sort: { isEmergency: -1, createdAt: 1 }, new: true }

    );
    console.log("Next patient:", next);

    if (!next) {
      return res.status(404).json({ error: 'No patients waiting in this stage.' });
    }

    res.json(next);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /complete/:id
 * Finishes service for the current stage and auto-advances:
 * - registration → doctor (back to waiting in doctor queue)
 * - doctor → completed (visit finished)
 */
router.put('/complete/:id', idParamValidators, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }
    if (patient.status !== 'serving') {
      return res.status(400).json({
        error: 'Patient must be in serving state before completing this stage.',
      });
    }

    if (patient.stage === 'registration') {
      patient.stage = 'doctor';
      patient.status = 'waiting';
    } else if (patient.stage === 'doctor') {
      patient.stage = 'completed';
      patient.status = 'completed';
    } else {
      return res.status(400).json({ error: 'Patient is not in an active queue stage.' });
    }

    await patient.save();
    return res.json(patient);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: 'Could not complete stage.' });
  }
});

/**
 * GET /status/:id
 * Returns the latest patient record for kiosk / SMS tracking.
 */
router.get('/status/:id', idParamValidators, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).lean();
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }
    return res.json(patient);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: 'Could not load status.' });
  }
});

module.exports = router;
