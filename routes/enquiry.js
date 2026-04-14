'use strict';

const express      = require('express');
const router       = express.Router();
const upload       = require('../middleware/upload');
const { sendEnquiryEmail } = require('../services/mailer');

/**
 * POST /api/enquiry
 * Accepts multipart/form-data with optional file attachments.
 * Sends an email notification and returns JSON.
 */
router.post('/', upload.array('files', parseInt(process.env.MAX_FILES || '10', 10)), async (req, res) => {
  try {
    const { name, email, phone, company, location, project_type, budget, message } = req.body;

    // ── Validation ────────────────────────────────────────────────
    const errors = [];
    if (!name     || name.trim().length < 2)    errors.push('Name is required');
    if (!email    || !isValidEmail(email))       errors.push('Valid email is required');
    if (!phone    || phone.trim().length < 7)    errors.push('Phone number is required');
    if (!location || location.trim().length < 3) errors.push('Project location is required');
    if (!project_type)                           errors.push('Project type is required');
    if (!message  || message.trim().length < 10) errors.push('Project description is required (min 10 chars)');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join('. ') });
    }

    // ── Collect uploaded file info ────────────────────────────────
    const files = (req.files || []).map(f => ({
      originalName: f.originalname,
      savedAs:      f.filename,
      size:         f.size,
      path:         f.path,
      mimetype:     f.mimetype
    }));

    // ── Build enquiry data object ─────────────────────────────────
    const enquiry = {
      name:         name.trim(),
      email:        email.trim().toLowerCase(),
      phone:        phone.trim(),
      company:      (company || '').trim() || '—',
      location:     location.trim(),
      project_type: project_type.trim(),
      budget:       (budget || '').trim() || '—',
      message:      message.trim(),
      files,
      submittedAt:  new Date().toISOString(),
      ip:           req.ip
    };

    // ── Send email ────────────────────────────────────────────────
    await sendEnquiryEmail(enquiry);

    console.log(`[ENQUIRY] New submission from ${enquiry.name} <${enquiry.email}> — ${enquiry.project_type}`);

    return res.status(200).json({
      success: true,
      message: 'Enquiry received. We will contact you within 48 hours.'
    });

  } catch (err) {
    console.error('[ENQUIRY ERROR]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send enquiry. Please try again or contact us directly at info@secphase.com'
    });
  }
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = router;
