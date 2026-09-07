import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

export function uploadErrorHandler(err, _req, res, next) {
  if (err.message === 'Only image files are allowed' || err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5MB)' : err.message,
    });
  }
  next(err);
}
