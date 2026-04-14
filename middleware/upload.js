'use strict';

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const crypto = require('crypto');

// Ensure upload directory exists
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Allowed MIME types
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  // AutoCAD / DWG (no standard MIME — allow by extension below)
  'application/octet-stream'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.jpg', '.jpeg', '.png', '.webp', '.dwg', '.dxf'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Sanitise original name and prepend timestamp + random token
    const ext   = path.extname(file.originalname).toLowerCase();
    const base  = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 40);
    const token = crypto.randomBytes(6).toString('hex');
    cb(null, `${Date.now()}_${token}_${base}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext) || ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${ext}`), false);
  }
};

const maxSizeMB = parseInt(process.env.MAX_FILE_MB || '20', 10);

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSizeMB * 1024 * 1024,
    files:    parseInt(process.env.MAX_FILES || '10', 10)
  }
});

module.exports = upload;
