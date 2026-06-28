import { ai, isAiMock, MockGeminiAgent } from '../config/gemini.js';

interface GeminiAnalysisResult {
  category: 'pothole' | 'water_leakage' | 'garbage_dumping' | 'broken_street_light' | 'drain_blockage' | 'road_damage' | 'public_safety' | 'infrastructure_damage' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  repairTimeline: string;
  trustScore: number;
  aiSummary: string;
  officerReport: string;
  resolutionChecklist: { task: string; completed: boolean }[];
}

export const analyzeIssueReport = async (
  title: string,
  description: string,
  mediaType: 'image' | 'video' | 'voice' | 'none',
  base64Media?: string,
  mimeType?: string
): Promise<GeminiAnalysisResult> => {
  if (isAiMock) {
    const mockAgent = new MockGeminiAgent();
    return mockAgent.analyzeIssue(title, description, mediaType, base64Media) as Promise<GeminiAnalysisResult>;
  }

  try {
    const contents: any[] = [];

    // Add media if present
    if (base64Media && mimeType) {
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Media
        }
      });
    }

    // Define the prompt with strict output schema
    const promptText = `
You are the AI Civic Assistant for "Community Hero", a hyperlocal problem solver application.
Analyze this civic issue report submitted by a citizen.

Citizen Title: "${title}"
Citizen Description: "${description}"
Report Media Type: "${mediaType}"

Your output must be a single, valid JSON object ONLY, containing no markdown framing (no \`\`\`json blocks) except the pure JSON structure. The JSON object must match this schema:

{
  "category": "pothole" | "water_leakage" | "garbage_dumping" | "broken_street_light" | "drain_blockage" | "road_damage" | "public_safety" | "infrastructure_damage" | "other",
  "severity": "low" | "medium" | "high" | "critical",
  "priority": "low" | "medium" | "high" | "critical",
  "department": "department name responsible for fixing this",
  "repairTimeline": "estimated timeline (e.g. 24-48 hours, 3 days)",
  "trustScore": 0 to 100 (score based on details, text clarity, and presence of physical media),
  "aiSummary": "friendly, conversational citizen-facing summary of the issue (2 sentences)",
  "officerReport": "formal municipal report summary details, including risk analysis and technical descriptions",
  "resolutionChecklist": [
    { "task": "specific action item for municipal worker", "completed": false }
  ]
}

Reasoning Guide (Do this internally before writing the JSON):
1. Categorize appropriately.
2. Determine Severity: "critical" means immediate safety danger or heavy flooding; "high" means blocked roads or leakages; "medium" means aesthetic or mild inconvenience (garbage, street light); "low" is minor.
3. Assign Priority based on severity and public impact.
4. Estimate public works departments: "Roads & Bridges", "Water & Sanitation", "Waste Management", "Electrical Division", etc.
5. Create a step-by-step resolution checklist for the field officers to follow.
`;

    contents.push(promptText);

    // Call Gemini 1.5 Flash Model
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text || '{}';
    // Parse the JSON safely
    const parsedData = JSON.parse(responseText.trim());

    // Set fallback defaults if any field is missing
    return {
      category: parsedData.category || 'other',
      severity: parsedData.severity || 'medium',
      priority: parsedData.priority || 'medium',
      department: parsedData.department || 'Public Works',
      repairTimeline: parsedData.repairTimeline || '5 days',
      trustScore: parsedData.trustScore ?? 75,
      aiSummary: parsedData.aiSummary || 'Issue received. AI analysis completed.',
      officerReport: parsedData.officerReport || 'Officer report details are standard.',
      resolutionChecklist: parsedData.resolutionChecklist || [
        { task: 'Dispatch inspector', completed: false },
        { task: 'Formulate repair schedule', completed: false }
      ]
    };
  } catch (error) {
    console.error('❌ Error in Gemini AI analysis. Falling back to keyword rules:', error);
    const mockAgent = new MockGeminiAgent();
    return mockAgent.analyzeIssue(title, description, mediaType, base64Media) as Promise<GeminiAnalysisResult>;
  }
};
