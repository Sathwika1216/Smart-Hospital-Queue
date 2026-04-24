const { body, param, validationResult } = require('express-validator');
const validator = require('validator');
const { QUEUE_STAGES } = require('../models/Patient');

/**
 * Shared handler: converts express-validator errors into 400 JSON responses.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array({ onlyFirstError: true }) });
  }
  return next();
}

/** Trim + strip HTML-ish noise from free-text fields */
function sanitizeText(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return validator.escape(trimmed);
}

const registerValidators = [
  body('name')
    .exists({ checkFalsy: true })
    .withMessage('name is required')
    .isString()
    .isLength({ min: 1, max: 120 })
    .withMessage('name must be a string, 1–120 characters')
    .customSanitizer(sanitizeText),
  body('age')
    .exists()
    .withMessage('age is required')
    .isInt({ min: 0, max: 150 })
    .withMessage('age must be an integer between 0 and 150')
    .toInt(),
  body('issue')
    .exists({ checkFalsy: true })
    .withMessage('issue is required')
    .isString()
    .isLength({ min: 1, max: 2000 })
    .withMessage('issue must be a string, 1–2000 characters')
    .customSanitizer(sanitizeText),
  body('isEmergency')
    .optional()
    .isBoolean()
    .withMessage('isEmergency must be a boolean')
    .toBoolean(),
  body('isRemote')
    .optional()
    .isBoolean()
    .withMessage('isRemote must be a boolean')
    .toBoolean(),
  handleValidationErrors,
];

const stageParamValidators = [
  param('stage')
    .isIn(QUEUE_STAGES)
    .withMessage(`stage must be one of: ${QUEUE_STAGES.join(', ')}`),
  handleValidationErrors,
];

const idParamValidators = [
  param('id')
    .isMongoId()
    .withMessage('id must be a valid MongoDB ObjectId'),
  handleValidationErrors,
];

module.exports = {
  registerValidators,
  stageParamValidators,
  idParamValidators,
  handleValidationErrors,
};
