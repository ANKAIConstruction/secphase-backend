'use strict';

const nodemailer = require('nodemailer');
const path       = require('path');

// ── Create transporter once ───────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',   // true = port 465, false = STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: { rejectUnauthorized: false }
  });
}

// ── HTML email template ────────────────────────────────────────────
function buildHtmlEmail(e) {
  const fileRows = e.files.length
    ? e.files.map(f =>
        `<tr>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${escHtml(f.originalName)}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;color:#666;">${(f.size/1024/1024).toFixed(2)} MB</td>
        </tr>`
      ).join('')
    : `<tr><td colspan="2" style="padding:6px 10px;color:#999;">No files uploaded</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f0f2f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:30px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0d1b2a;padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="display:inline-block;background:#2e7d32;border-radius:4px;padding:6px 12px;font-size:18px;font-weight:bold;color:#fff;margin-bottom:10px;">SP</div>
                  <div style="color:#ffffff;font-size:20px;font-weight:bold;margin:0;">Second Phase Construction</div>
                  <div style="color:#90a4ae;font-size:13px;margin-top:4px;">New Project Enquiry</div>
                </td>
                <td align="right" style="vertical-align:top;">
                  <div style="background:#2e7d32;color:#fff;font-size:12px;font-weight:bold;padding:5px 14px;border-radius:20px;display:inline-block;white-space:nowrap;">NEW ENQUIRY</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Project type banner -->
        <tr>
          <td style="background:#2e7d32;padding:12px 32px;">
            <span style="color:#fff;font-size:14px;font-weight:bold;">${escHtml(e.project_type)}</span>
            <span style="color:rgba(255,255,255,0.6);font-size:13px;margin-left:12px;">${new Date(e.submittedAt).toUTCString()}</span>
          </td>
        </tr>

        <!-- Contact details -->
        <tr>
          <td style="padding:28px 32px 0;">
            <div style="font-size:16px;font-weight:bold;color:#0d1b2a;margin-bottom:16px;border-bottom:2px solid #2e7d32;padding-bottom:8px;">Contact Information</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${row('Name',     e.name)}
              ${row('Email',    e.email)}
              ${row('Phone',    e.phone)}
              ${row('Company',  e.company)}
            </table>
          </td>
        </tr>

        <!-- Project details -->
        <tr>
          <td style="padding:24px 32px 0;">
            <div style="font-size:16px;font-weight:bold;color:#0d1b2a;margin-bottom:16px;border-bottom:2px solid #2e7d32;padding-bottom:8px;">Project Details</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${row('Location',     e.location)}
              ${row('Project Type', e.project_type)}
              ${row('Budget',       e.budget)}
            </table>
          </td>
        </tr>

        <!-- Description -->
        <tr>
          <td style="padding:24px 32px 0;">
            <div style="font-size:16px;font-weight:bold;color:#0d1b2a;margin-bottom:12px;border-bottom:2px solid #2e7d32;padding-bottom:8px;">Project Description</div>
            <div style="background:#f4f6f8;border-left:4px solid #2e7d32;border-radius:0 4px 4px 0;padding:14px 18px;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${escHtml(e.message)}</div>
          </td>
        </tr>

        <!-- Uploaded files -->
        <tr>
          <td style="padding:24px 32px 0;">
            <div style="font-size:16px;font-weight:bold;color:#0d1b2a;margin-bottom:12px;border-bottom:2px solid #2e7d32;padding-bottom:8px;">Uploaded Files (${e.files.length})</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:4px;font-size:13px;">
              <tr style="background:#f4f6f8;">
                <th style="padding:8px 10px;text-align:left;color:#546e7a;">Filename</th>
                <th style="padding:8px 10px;text-align:left;color:#546e7a;">Size</th>
              </tr>
              ${fileRows}
            </table>
            ${e.files.length > 0 ? '<p style="font-size:12px;color:#999;margin-top:8px;">Files are saved on the server in the uploads directory.</p>' : ''}
          </td>
        </tr>

        <!-- Reply button -->
        <tr>
          <td style="padding:28px 32px;">
            <a href="mailto:${escHtml(e.email)}?subject=Re: Your Project Enquiry — Second Phase Construction"
               style="display:inline-block;background:#2e7d32;color:#fff;text-decoration:none;padding:13px 28px;border-radius:4px;font-size:14px;font-weight:bold;">
              Reply to ${escHtml(e.name)} →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0d1b2a;padding:18px 32px;">
            <div style="color:#90a4ae;font-size:12px;line-height:1.7;">
              Second Phase Construction Company &nbsp;·&nbsp; +966 55 195 0324 &nbsp;·&nbsp; info@secphase.com &nbsp;·&nbsp; www.secphase.com<br>
              Saudi Arabia · GCC · Turkey · Middle East · Africa
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label, value) {
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:#546e7a;width:130px;vertical-align:top;">${escHtml(label)}</td>
    <td style="padding:6px 0;font-size:14px;color:#1a1a1a;font-weight:500;">${escHtml(value)}</td>
  </tr>`;
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Plain-text fallback ────────────────────────────────────────────
function buildTextEmail(e) {
  const files = e.files.length
    ? e.files.map(f => `  - ${f.originalName} (${(f.size/1024/1024).toFixed(2)} MB)`).join('\n')
    : '  No files uploaded';

  return `NEW PROJECT ENQUIRY — SECOND PHASE CONSTRUCTION
${'='.repeat(55)}

CONTACT
  Name    : ${e.name}
  Email   : ${e.email}
  Phone   : ${e.phone}
  Company : ${e.company}

PROJECT
  Location : ${e.location}
  Type     : ${e.project_type}
  Budget   : ${e.budget}

DESCRIPTION
${e.message}

UPLOADED FILES (${e.files.length})
${files}

Submitted : ${e.submittedAt}
${'─'.repeat(55)}
Second Phase Construction  |  +966 55 195 0324  |  info@secphase.com
`;
}

// ── Main export ────────────────────────────────────────────────────
async function sendEnquiryEmail(enquiry) {
  const transporter = createTransporter();

  // Attach uploaded files to the email (up to 10 MB total to avoid SMTP limits)
  const attachments = enquiry.files
    .filter(f => f.size < 8 * 1024 * 1024)     // skip files > 8 MB as attachments
    .map(f => ({
      filename: f.originalName,
      path:     f.path
    }));

  const mailOptions = {
    from:        process.env.MAIL_FROM || 'Second Phase Website <info@secphase.com>',
    to:          process.env.MAIL_TO   || 'info@secphase.com',
    replyTo:     enquiry.email,
    subject:     `[New Enquiry] ${enquiry.project_type} — ${enquiry.name}`,
    text:        buildTextEmail(enquiry),
    html:        buildHtmlEmail(enquiry),
    attachments
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[MAILER] Email sent — MessageID: ${info.messageId}`);
  return info;
}

module.exports = { sendEnquiryEmail };
