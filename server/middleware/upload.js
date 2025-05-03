const multer = require('multer');
const path = require('path');

// Store in /uploads with original filename prefixed by timestamp
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    const uniq = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext  = path.extname(file.originalname);
    cb(null, `${uniq}${ext}`);
  }
});

// Only accept PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'), false);
};

module.exports = multer({ storage, fileFilter });
