'use strict';

async function sendEnquiryEmail(enquiry) {
  const fileNames = enquiry.files.length
    ? enquiry.files.map(f => f.originalname + ' (' + (f.size/1024/1024).toFixed(1) + ' MB)').join(', ')
    : '—';

  const htmlContent = `
    <h2 style="color:#2e7d32">New Project Enquiry — Second Phase</h2>
    <table style="font-family:Arial;font-size:14px;width:100%">
      <tr><td style="padding:8px;color:#666">Name</td><td style="padding:8px"><b>${enquiry.name}</b></td></tr>
      <tr><td style="padding:8px;color:#666">Email</td><td style="padding:8px">${enquiry.email}</td></tr>
      <tr><td style="padding:8px;color:#666">Phone</td><td style="padding:8px">${enquiry.phone}</td></tr>
      <tr><td style="padding:8px;color:#666">Company</td><td style="padding:8px">${enquiry.company}</td></tr>
      <tr><td style="padding:8px;color:#666">Location</td><td style="padding:8px">${enquiry.location}</td></tr>
      <tr><td style="padding:8px;color:#666">Project Type</td><td style="padding:8px">${enquiry.project_type}</td></tr>
      <tr><td style="padding:8px;color:#666">Budget</td><td style="padding:8px">${enquiry.budget}</td></tr>
      <tr><td style="padding:8px;color:#666">Files</td><td style="padding:8px">${fileNames}</td></tr>
    </table>
    <h3 style="color:#2e7d32">Description</h3>
    <p style="font-family:Arial;font-size:14px">${enquiry.message}</p>
    <hr>
    <p style="font-family:Arial;font-size:12px;color:#999">Second Phase Construction | +966 55 195 0324 | info@secphase.com</p>
  `;

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'Second Phase Website', email: 'info@secphase.com' },
      to: [{ email: process.env.MAIL_TO || 'info@secphase.com' }],
      replyTo: { email: enquiry.email, name: enquiry.name },
      subject: '[New Enquiry] ' + enquiry.project_type + ' — ' + enquiry.name,
      htmlContent: htmlContent
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error('Brevo API error: ' + err);
  }

  console.log('[MAILER] Email sent via Brevo API');
  return true;
}

module.exports = { sendEnquiryEmail };