import { Response } from 'express';
import { db, storage, FieldValue, isMock } from '../config/firebase.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { calculateDistance } from '../utils/distance.js';
import { analyzeIssueReport } from '../utils/geminiAgent.js';
import { awardXp } from '../utils/gamification.js';

// XSS Sanitizer Helper
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Category-based stock images to keep the mock visual experience looking premium
const MOCK_IMAGES: { [key: string]: string } = {
  pothole: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800&auto=format&fit=crop&q=60',
  road_damage: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800&auto=format&fit=crop&q=60',
  water_leakage: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop&q=60',
  garbage_dumping: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=60',
  broken_street_light: 'https://images.unsplash.com/photo-1509024644558-2f56ce76c090?w=800&auto=format&fit=crop&q=60',
  drain_blockage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=60',
  public_safety: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800&auto=format&fit=crop&q=60',
  infrastructure_damage: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&auto=format&fit=crop&q=60',
  other: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60'
};

// 1. Submit a new Civic Issue
export const reportIssue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, latitude, longitude, address, ward, mediaType } = req.body;
    const user = req.user!;

    if (!title || !description || !latitude || !longitude) {
      res.status(400).json({ error: 'Missing required parameters. Title, description, and GPS coordinates are mandatory.' });
      return;
    }

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (isNaN(latNum) || latNum < -90 || latNum > 90 || isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      res.status(400).json({ error: 'Invalid GPS coordinates provided. Latitude must be between -90/90, and longitude between -180/180.' });
      return;
    }

    // Escape and truncate inputs to prevent buffer/injection attacks
    const sanitizedTitle = escapeHtml(title.trim()).slice(0, 100);
    const sanitizedDescription = escapeHtml(description.trim()).slice(0, 2000);
    const sanitizedAddress = escapeHtml(address ? address.trim() : 'Auto-detected Location').slice(0, 250);
    const sanitizedWard = escapeHtml(ward ? ward.trim() : 'Ward 1').slice(0, 50);

    let mediaUrl = '';
    let base64Media = '';
    let mimeType = '';

    // Handle Uploaded File
    if (req.file) {
      mimeType = req.file.mimetype;
      base64Media = req.file.buffer.toString('base64');

      if (isMock) {
        // Mock Storage save: return a category-relevant beautiful placeholder
        mediaUrl = '';
      } else {
        const bucket = storage.bucket();
        const filename = `issues/${user.uid}_${Date.now()}_${req.file.originalname}`;
        const fileRef = bucket.file(filename);

        await fileRef.save(req.file.buffer, {
          metadata: { contentType: req.file.mimetype }
        });
        
        // Retrieve public URL or signed url
        const [signedUrl] = await fileRef.getSignedUrl({
          action: 'read',
          expires: '03-09-2499' // Far future
        });
        mediaUrl = signedUrl;
      }
    }

    // Call Gemini Agent for Multimodal Analysis
    console.log(`🤖 Invoking Gemini AI Agent for issue: "${sanitizedTitle}"`);
    const aiResult = await analyzeIssueReport(sanitizedTitle, sanitizedDescription, mediaType || 'none', base64Media, mimeType);

    // If mediaUrl was mock-empty, bind to standard category photo
    if (!mediaUrl) {
      mediaUrl = MOCK_IMAGES[aiResult.category] || MOCK_IMAGES['other'];
    }

    // Duplicate Check: Check for open reports of same category within 150m
    let isDuplicate = false;
    let duplicateOfId = '';

    const issuesSnapshot = await db.collection('issues')
      .where('category', '==', aiResult.category)
      .get();

    issuesSnapshot.forEach((doc: any) => {
      const issue = doc.data();
      // Check active, unresolved statuses
      if (['submitted', 'verified', 'assigned', 'in_progress'].includes(issue.status)) {
        const dist = calculateDistance(latNum, lonNum, issue.location.latitude, issue.location.longitude);
        if (dist <= 0.15) { // 150 meters
          isDuplicate = true;
          duplicateOfId = doc.id;
        }
      }
    });

    const newIssueId = db.collection('issues').doc().id;
    const now = new Date();

    const newIssueData = {
      id: newIssueId,
      title: sanitizedTitle,
      description: sanitizedDescription,
      category: aiResult.category,
      severity: aiResult.severity,
      priority: aiResult.priority,
      status: isDuplicate ? 'draft' : 'submitted', // duplicate reports are flagged for review
      
      location: {
        latitude: latNum,
        longitude: lonNum,
        address: sanitizedAddress,
        ward: sanitizedWard
      },
      
      mediaUrl,
      mediaType: mediaType || 'none',
      
      reportedBy: user.uid,
      reportedByName: user.name,
      department: aiResult.department,
      
      upvotes: 0,
      downvotes: 0,
      votes: {},
      
      aiSummary: aiResult.aiSummary,
      officerReport: aiResult.officerReport,
      resolutionChecklist: aiResult.resolutionChecklist,
      repairTimeline: aiResult.repairTimeline,
      trustScore: isDuplicate ? Math.max(10, aiResult.trustScore - 40) : aiResult.trustScore,
      isDuplicate,
      duplicateOf: duplicateOfId || null,
      
      timeline: [
        {
          status: 'submitted',
          timestamp: now,
          note: isDuplicate ? '⚠️ Flagged as potential duplicate issue.' : 'Report submitted and processed by Gemini AI.',
          updatedBy: user.name
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    await db.collection('issues').doc(newIssueId).set(newIssueData);

    // Award Gamification XP for reporting (+20 XP, bonus if they supply imageproof +10 XP)
    let xpReward = 20;
    if (mediaType !== 'none') xpReward += 10;
    const gamification = await awardXp(user.uid, xpReward);

    res.status(201).json({
      message: 'Issue report created successfully.',
      issue: newIssueData,
      gamification
    });

  } catch (error: any) {
    console.error('Error creating issue report:', error);
    res.status(500).json({ error: error.message || 'Failed to submit issue report.' });
  }
};

// 2. Fetch Issues with Query Filtering
export const getIssues = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category, status, priority, department, latitude, longitude, radius } = req.query;

    let queryRef = db.collection('issues');
    
    // Applying Firestore where clauses
    let snapshot;
    if (category) queryRef = queryRef.where('category', '==', category);
    if (status) queryRef = queryRef.where('status', '==', status);
    if (priority) queryRef = queryRef.where('priority', '==', priority);
    if (department) queryRef = queryRef.where('department', '==', department);

    snapshot = await queryRef.get();

    const issues: any[] = [];
    snapshot.forEach((doc: any) => {
      issues.push(doc.data());
    });

    // Geo-radius filtering in-memory
    if (latitude && longitude && radius) {
      const userLat = parseFloat(latitude as string);
      const userLon = parseFloat(longitude as string);
      const radiusKm = parseFloat(radius as string);

      const filteredIssues = issues.filter(issue => {
        const dist = calculateDistance(userLat, userLon, issue.location.latitude, issue.location.longitude);
        return dist <= radiusKm;
      });

      res.status(200).json(filteredIssues);
      return;
    }

    res.status(200).json(issues);
  } catch (error: any) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch issues.' });
  }
};

// 3. Get single issue details + comments
export const getIssueById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const issueDoc = await db.collection('issues').doc(id).get();

    if (!issueDoc.exists) {
      res.status(404).json({ error: 'Civic issue report not found.' });
      return;
    }

    // Fetch comments for this issue
    const commentsSnapshot = await db.collection('comments')
      .where('issueId', '==', id)
      .get();

    const comments: any[] = [];
    commentsSnapshot.forEach((doc: any) => {
      comments.push(doc.data());
    });

    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    res.status(200).json({
      ...issueDoc.data(),
      comments
    });
  } catch (error: any) {
    console.error('Error fetching issue detail:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve issue details.' });
  }
};

// 4. Vote / Validate an Issue
export const voteIssue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'up' | 'down'
    const user = req.user!;

    if (!['up', 'down'].includes(voteType)) {
      res.status(400).json({ error: 'Invalid voteType. Must be either "up" or "down".' });
      return;
    }

    const issueRef = db.collection('issues').doc(id);
    const issueDoc = await issueRef.get();

    if (!issueDoc.exists) {
      res.status(404).json({ error: 'Issue not found.' });
      return;
    }

    const issue = issueDoc.data();
    const votes = issue.votes || {};
    const previousVote = votes[user.uid];

    let upvoteChange = 0;
    let downvoteChange = 0;

    if (previousVote === voteType) {
      // Remove vote
      delete votes[user.uid];
      if (voteType === 'up') upvoteChange = -1;
      else downvoteChange = -1;
    } else {
      // Update or add vote
      votes[user.uid] = voteType;
      if (voteType === 'up') {
        upvoteChange = 1;
        if (previousVote === 'down') downvoteChange = -1;
      } else {
        downvoteChange = 1;
        if (previousVote === 'up') upvoteChange = -1;
      }
    }

    const updatedUpvotes = Math.max(0, (issue.upvotes || 0) + upvoteChange);
    const updatedDownvotes = Math.max(0, (issue.downvotes || 0) + downvoteChange);

    // Auto-Verification logic:
    // If upvotes >= 5, automatically promote status to 'verified' if it was 'submitted'
    let newStatus = issue.status;
    const newTimeline = [...(issue.timeline || [])];

    if (updatedUpvotes >= 5 && issue.status === 'submitted') {
      newStatus = 'verified';
      newTimeline.push({
        status: 'verified',
        timestamp: new Date(),
        note: '🟢 Auto-promoted to Verified status by community upvote threshold.',
        updatedBy: 'Community Verification Engine'
      });

      // Award major XP (+50 XP) to original reporter for validated civic contribution
      await awardXp(issue.reportedBy, 50);
    }

    await issueRef.set({
      upvotes: updatedUpvotes,
      downvotes: updatedDownvotes,
      votes,
      status: newStatus,
      timeline: newTimeline,
      updatedAt: new Date()
    }, { merge: true });

    // Award +5 XP to voter for community participation
    const gamification = await awardXp(user.uid, 5);

    res.status(200).json({
      message: 'Vote saved successfully.',
      upvotes: updatedUpvotes,
      downvotes: updatedDownvotes,
      status: newStatus,
      gamification
    });

  } catch (error: any) {
    console.error('Error voting issue:', error);
    res.status(500).json({ error: error.message || 'Failed to register vote.' });
  }
};

// 5. Add Comment (with optional image validation proof)
export const addComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // issueId
    const { text, isVerificationProof, verificationDecision } = req.body;
    const user = req.user!;

    if (!text) {
      res.status(400).json({ error: 'Comment text is required.' });
      return;
    }

    const sanitizedText = escapeHtml(text.trim()).slice(0, 1000);

    let proofUrl = '';
    
    // File upload logic for proof
    if (req.file) {
      if (isMock) {
        proofUrl = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=60';
      } else {
        const bucket = storage.bucket();
        const filename = `comments/${id}_${user.uid}_${Date.now()}_${req.file.originalname}`;
        const fileRef = bucket.file(filename);
        await fileRef.save(req.file.buffer, { metadata: { contentType: req.file.mimetype } });
        const [signedUrl] = await fileRef.getSignedUrl({ action: 'read', expires: '03-09-2499' });
        proofUrl = signedUrl;
      }
    }

    const commentId = db.collection('comments').doc().id;
    const commentData = {
      id: commentId,
      issueId: id,
      userId: user.uid,
      userName: user.name,
      userRole: user.role,
      text: sanitizedText,
      proofUrl: proofUrl || null,
      isVerificationProof: isVerificationProof === 'true' || isVerificationProof === true,
      verificationDecision: verificationDecision || null,
      createdAt: new Date()
    };

    await db.collection('comments').doc(commentId).set(commentData);

    // Recalculate issue trust score if validation proof is submitted
    if (commentData.isVerificationProof) {
      const issueRef = db.collection('issues').doc(id);
      const issueDoc = await issueRef.get();

      if (issueDoc.exists) {
        const issue = issueDoc.data();
        let trustAdjustment = 0;
        
        if (verificationDecision === 'verify') trustAdjustment = 10;
        else if (verificationDecision === 'dispute') trustAdjustment = -15;

        const newTrust = Math.min(100, Math.max(0, (issue.trustScore || 75) + trustAdjustment));
        
        await issueRef.set({
          trustScore: newTrust,
          updatedAt: new Date()
        }, { merge: true });
      }
    }

    // Award +10 XP for civic dialogue, +25 XP if they supply verification proof!
    const xpReward = commentData.isVerificationProof ? 25 : 10;
    const gamification = await awardXp(user.uid, xpReward);

    res.status(201).json({
      message: 'Comment added successfully.',
      comment: commentData,
      gamification
    });

  } catch (error: any) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message || 'Failed to add comment.' });
  }
};

// 6. Update Issue Status (Officer / Admin workflow)
export const updateIssueStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, resolutionChecklist, officerReport, department, assignedTo } = req.body;
    const user = req.user!;

    const issueRef = db.collection('issues').doc(id);
    const issueDoc = await issueRef.get();

    if (!issueDoc.exists) {
      res.status(404).json({ error: 'Issue not found.' });
      return;
    }

    const issue = issueDoc.data();
    const updates: any = {
      updatedAt: new Date()
    };

    const newTimeline = [...(issue.timeline || [])];

    if (status && status !== issue.status) {
      updates.status = status;
      newTimeline.push({
        status: status,
        timestamp: new Date(),
        note: `Status transitioned to "${status}" by municipal representative.`,
        updatedBy: user.name
      });
      updates.timeline = newTimeline;
    }

    if (resolutionChecklist) {
      // Expect list format, merge and update
      updates.resolutionChecklist = Array.isArray(resolutionChecklist) 
        ? resolutionChecklist 
        : JSON.parse(resolutionChecklist);
    }

    if (officerReport) updates.officerReport = officerReport;
    if (department) updates.department = department;

    // Assigning to officer
    if (assignedTo) {
      updates.assignedTo = assignedTo;
      // Fetch officer name
      const officerDoc = await db.collection('users').doc(assignedTo).get();
      if (officerDoc.exists) {
        updates.assignedToName = officerDoc.data().name;
      }
    }

    await issueRef.set(updates, { merge: true });

    // Gamification Reward: If status changed to 'resolved', award original reporter +100 XP, and officer +150 XP!
    let reporterGamification = null;
    let officerGamification = null;

    if (status === 'resolved' && issue.status !== 'resolved') {
      reporterGamification = await awardXp(issue.reportedBy, 100);
      officerGamification = await awardXp(user.uid, 150);
    }

    res.status(200).json({
      message: 'Issue details updated successfully.',
      updates,
      reporterGamification,
      officerGamification
    });

  } catch (error: any) {
    console.error('Error updating issue status:', error);
    res.status(500).json({ error: error.message || 'Failed to update issue.' });
  }
};
