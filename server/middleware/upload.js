const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 80 * 1024 * 1024,
    files: 15
  },
  fileFilter: (req, file, cb) => {
    const ok = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'
    ].includes(file.mimetype);
    cb(ok ? null : new Error(`Unsupported mime: ${file.mimetype}`), ok);
  }
});
module.exports = { upload };
