import { Router } from 'express';
import multer from 'multer';
import { 
  reportIssue, 
  getIssues, 
  getIssueById, 
  voteIssue, 
  addComment, 
  updateIssueStatus 
} from '../controllers/issueController.js';
import { authenticateUser, requireRole } from '../middlewares/authMiddleware.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Configure multer memory storage for handling image/audio uploads with mimetype checks
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/png', 'image/jpeg', 'image/jpg', 'image/webp',
      'video/mp4', 'video/quicktime',
      'audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only standard images, videos, and audio files are permitted.'));
    }
  }
});

// Submit a new civic issue (Citizen/Moderator/Admin) with strict AI rate limiting
router.post('/', authenticateUser, rateLimiter(true), upload.single('mediaFile'), reportIssue);

// Fetch civic issue list with filters (Category, Status, Priority, Distance)
router.get('/', authenticateUser, getIssues);

// Fetch detailed view of a single issue
router.get('/:id', authenticateUser, getIssueById);

// Vote (upvote/downvote) to validate reports
router.post('/:id/vote', authenticateUser, voteIssue);

// Comment on issue, with optional verification photo proof uploads
router.post('/:id/comment', authenticateUser, rateLimiter(true), upload.single('proofFile'), addComment);

// Update status, checklist, or department assignments (Officer/Admin only)
router.patch('/:id/status', authenticateUser, requireRole(['officer', 'admin']), updateIssueStatus);

export default router;
