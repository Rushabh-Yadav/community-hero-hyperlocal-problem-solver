import { Response } from 'express';
import { db } from '../config/firebase.js';
import { ai, isAiMock, MockGeminiAgent } from '../config/gemini.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

// 1. Chatbot Assistant with DB Context Integration
export const chatAssistant = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { message, chatHistory } = req.body;
    const user = req.user!;

    if (!message) {
      res.status(400).json({ error: 'Message content is required.' });
      return;
    }

    // Fetch context from Firestore (Active Issues & User Profile)
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const issuesSnapshot = await db.collection('issues').get();
    const issuesList: any[] = [];
    issuesSnapshot.forEach((doc: any) => {
      const data = doc.data();
      // Exclude redundant checklist details to keep token counts small
      issuesList.push({
        id: data.id,
        title: data.title,
        status: data.status,
        category: data.category,
        address: data.location?.address,
        reportedBy: data.reportedBy
      });
    });

    const contextPrompt = `
You are the Community Hero AI Civic Assistant. You help citizens and officers manage local issues.
Here is the current database context:
- Current User: Name is "${user.name}", Role is "${user.role}", Reputation Score is ${userData?.reputationScore || 100}, Level is ${userData?.level || 1}, XP is ${userData?.xp || 0}, Badges: ${JSON.stringify(userData?.badges || [])}.
- Active Civic Issues in Database: ${JSON.stringify(issuesList)}.

When answering, reference this data if appropriate (e.g. if the user asks about their level, badges, or a reported pothole).
Remain helpful, concise, and professional. 

User Message: "${message}"
`;

    if (isAiMock) {
      // Mock Response Logic
      let reply = "Hello! I am your Community Hero chatbot. How can I help you improve the neighborhood today?";
      const lower = message.toLowerCase();
      
      if (lower.includes('level') || lower.includes('xp') || lower.includes('badge')) {
        reply = `Hi ${user.name}, you are currently at Level ${userData?.level || 1} with ${userData?.xp || 0} XP! You have unlocked badges like ${userData?.badges?.join(', ') || 'none yet'}. Keep reporting to earn more!`;
      } else if (lower.includes('open') || lower.includes('issue') || lower.includes('pothole')) {
        const userIssues = issuesList.filter(i => i.reportedBy === user.uid);
        if (userIssues.length > 0) {
          reply = `You have reported ${userIssues.length} issue(s). Specifically, "${userIssues[0].title}" is currently in "${userIssues[0].status}" status.`;
        } else {
          reply = `There are currently ${issuesList.length} total issues open in the community. Let me know if you would like details on any specific category!`;
        }
      } else if (lower.includes('how to report') || lower.includes('help')) {
        reply = "To report a problem, click on 'Report Issue' in the navigation bar. You can upload an image, select a category, and our AI will automatically classify its severity and department allocation!";
      }

      res.status(200).json({ reply });
      return;
    }

    // Call real Gemini model
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [contextPrompt],
    });

    res.status(200).json({
      reply: response.text || 'I am sorry, I could not formulate a response at this time.'
    });

  } catch (error: any) {
    console.error('Chat Assistant Error:', error);
    res.status(500).json({ error: error.message || 'Assistant encountered an error.' });
  }
};

// 2. Retrieve AI Predictions (infrastructure risks and hotspots)
export const getAiPredictions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (isAiMock) {
      const mockAgent = new MockGeminiAgent();
      const predictions = await mockAgent.predictHotspots();
      res.status(200).json(predictions);
      return;
    }

    // Dynamic predictive prompt using existing open issues database to identify patterns
    const issuesSnapshot = await db.collection('issues').get();
    const activeIssues: any[] = [];
    issuesSnapshot.forEach((doc: any) => {
      const d = doc.data();
      activeIssues.push({
        category: d.category,
        location: d.location,
        createdAt: d.createdAt
      });
    });

    const predictionPrompt = `
You are the Community Hero Predictive Analytics Engine.
Based on the following active issues data, generate a set of 3 predicted future civic risks (e.g. roads likely to fail, garbage pileups, drainage flooding hazards).

Historical Civic Issues Context:
${JSON.stringify(activeIssues)}

Your output must be a single, valid JSON array ONLY, containing no markdown formatting. The format should be:
[
  {
    "id": "string",
    "type": "road_failure" | "garbage_hotspot" | "water_leakage_hotspot" | "flood_risk",
    "location": {
      "latitude": number,
      "longitude": number,
      "address": "string"
    },
    "confidence": number (between 0.0 and 1.0),
    "reasoning": "brief detail on why this prediction was made (e.g. recurring reports or seasonal context)",
    "suggestedAction": "preventative municipal action item"
  }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [predictionPrompt],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text || '[]';
    const predictions = JSON.parse(responseText.trim());

    res.status(200).json(predictions);

  } catch (error: any) {
    console.error('Predictions Error:', error);
    // Fallback to mock predictions to prevent frontend crashes
    const mockAgent = new MockGeminiAgent();
    const predictions = await mockAgent.predictHotspots();
    res.status(200).json(predictions);
  }
};
