import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let ai: any = null;
let isAiMock = false;

const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log('✅ Google Gemini API client initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize Gemini API client. Switching to mock AI.', error);
    isAiMock = true;
  }
} else {
  console.warn('⚠️ GEMINI_API_KEY not configured. Bootstrapping application in LOCAL MOCK AI MODE.');
  isAiMock = true;
}

// Keyword-based Rule Engine for mock AI processing of reports
export class MockGeminiAgent {
  async analyzeIssue(title: string, description: string, mediaType: 'image' | 'video' | 'voice' | 'none', base64Media?: string) {
    const combinedText = `${title} ${description}`.toLowerCase();
    
    let category: string = 'other';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let department = 'Public Works';
    let repairTimeline = '5-7 days';
    let trustScore = 75;
    
    let checklist: string[] = [
      'Dispatch inspection team',
      'Secure the surrounding safety zone',
      'Formulate repair plan',
      'Allocate materials and workforce',
      'Execute repair operations',
      'Post-repair inspection & quality sign-off'
    ];

    if (combinedText.includes('pothole') || combinedText.includes('road') || combinedText.includes('asphalt')) {
      category = 'road_damage';
      severity = 'high';
      priority = 'high';
      department = 'Roads and Infrastructure Department';
      repairTimeline = '3 days';
      checklist = [
        'Inspect pothole dimensions and depth',
        'Place reflective safety cones/barricades around the hazard',
        'Clean debris and moisture from the cavity',
        'Apply hot-mix asphalt aggregate filling',
        'Compact asphalt using heavy roller machinery',
        'Verify level smoothness and reopen the lane'
      ];
    } else if (combinedText.includes('water') || combinedText.includes('leak') || combinedText.includes('pipe')) {
      category = 'water_leakage';
      severity = combinedText.includes('flooding') ? 'critical' : 'high';
      priority = severity === 'critical' ? 'critical' : 'high';
      department = 'Water Supply and Sanitation Department';
      repairTimeline = '24-48 hours';
      checklist = [
        'Locate and isolate the leaking pipeline valve',
        'Dig excavation channel to expose the damaged conduit',
        'Extract ruptured section of pipe',
        'Install high-grade sleeve seal or replace pipe segment',
        'Run pressure test to check seal integrity',
        'Backfill the excavation site and repave surface'
      ];
    } else if (combinedText.includes('garbage') || combinedText.includes('dump') || combinedText.includes('trash') || combinedText.includes('waste')) {
      category = 'garbage_dumping';
      severity = 'medium';
      priority = 'medium';
      department = 'Sanitation and Waste Management';
      repairTimeline = '24 hours';
      checklist = [
        'Deploy waste disposal truck and cleanup crew',
        'Collect and shovel scattered waste materials',
        'Sanitize the ground surface with chemical disinfectants',
        'Erect a "No Dumping - Fine Applicable" warning sign',
        'Log coordinates for routine monitoring patrols'
      ];
    } else if (combinedText.includes('light') || combinedText.includes('street light') || combinedText.includes('dark')) {
      category = 'broken_street_light';
      severity = 'medium';
      priority = 'medium';
      department = 'Electrical and Public Lighting Division';
      repairTimeline = '48 hours';
      checklist = [
        'Isolate local electrical grid node for safety',
        'Deploy hydraulic lift bucket truck to access the pole',
        'Check circuit wiring and replace damaged capacitor/choke',
        'Replace luminaire with energy-efficient LED lamp bulb',
        'Test switch functionality using photocell simulator'
      ];
    } else if (combinedText.includes('drain') || combinedText.includes('sewer') || combinedText.includes('block')) {
      category = 'drain_blockage';
      severity = 'high';
      priority = 'high';
      department = 'Drainage and Sewerage Maintenance';
      repairTimeline = '2-3 days';
      checklist = [
        'Open drainage manhole cover safely using venting rules',
        'Insert industrial vacuum suction hose or mechanical rodder',
        'Clear plastic accumulation and sediment clogging blockages',
        'Flush drainage conduits with high-pressure hydro-jets',
        'Inspect structural walls of drain for collapses'
      ];
    }

    if (mediaType !== 'none') {
      trustScore += 15; // Higher score if physical evidence is present
    }

    const aiSummary = `This report details an active ${category.replace('_', ' ')} issue at the reported location. A semantic text match suggests moderate to high urgency. Department allocation points directly to the "${department}" for immediate scheduling.`;
    const officerReport = `REPORT ID: CH-${Math.floor(1000 + Math.random() * 9000)}\nCATEGORY: ${category.toUpperCase()}\nSEVERITY: ${severity.toUpperCase()}\n\nEXECUTIVE SUMMARY:\nThe citizen reported a hazard: "${description}". Immediate site verification is recommended due to potential safety impacts. Please execute the generated action items sequentially.`;

    return {
      category,
      severity,
      priority,
      department,
      repairTimeline,
      trustScore: Math.min(100, trustScore),
      aiSummary,
      officerReport,
      resolutionChecklist: checklist.map(t => ({ task: t, completed: false })),
      isDuplicate: false
    };
  }

  async predictHotspots() {
    const now = new Date();
    return [
      {
        id: 'pred-1',
        type: 'road_failure',
        location: { latitude: 12.9716, longitude: 77.5946, address: 'Kasturba Road, Bengaluru' },
        confidence: 0.88,
        reasoning: 'Heavy monsoon runoff coupled with 40% traffic load increase. Subsurface moisture sensor alerts indicate soil erosion beneath asphalt.',
        suggestedAction: 'Deploy micro-surfacing emulsion seal coating within 15 days to block water penetration.',
        predictedAt: now
      },
      {
        id: 'pred-2',
        type: 'garbage_hotspot',
        location: { latitude: 12.9279, longitude: 77.6271, address: 'Koramangala 5th Block, Bengaluru' },
        confidence: 0.92,
        reasoning: 'Repeated illegal dumpings logged during night hours. Lack of street lighting in 150m radius makes this site vulnerable.',
        suggestedAction: 'Install smart CCTV solar-cam and execute night-watch patrol between 10 PM and 4 AM.',
        predictedAt: now
      },
      {
        id: 'pred-3',
        type: 'water_leakage_hotspot',
        location: { latitude: 12.9591, longitude: 77.6974, address: 'Marathahalli Bridge, Bengaluru' },
        confidence: 0.79,
        reasoning: 'Underground pipeline age exceeds 25 years. Flow pressure meter deviations suggest minor leaks causing ground saturation.',
        suggestedAction: 'Initiate acoustic leak detection test and plan partial pipeline relining.',
        predictedAt: now
      }
    ];
  }
}

export { ai, isAiMock };
