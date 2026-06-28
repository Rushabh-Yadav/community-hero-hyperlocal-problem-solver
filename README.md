# Community Hero – Hyperlocal Problem Solver

Community Hero is an AI-powered civic engagement and problem-solving web platform built for the **Google Developers x Coding Ninjas Vibe2Ship Hackathon**. It bridges the communication gap between citizens and local municipalities, using Google Gemini API, Firebase, and Google Maps to report, verify, schedule, and resolve neighborhood hazards (potholes, water leakages, broken lights, etc.).

---

## 🚀 Key Features

1. **Multimodal Reporting**: Report local issues with text description, photos, videos, or recorded voice notes.
2. **Gemini AI Civic Agent**: Uses `gemini-1.5-flash` to evaluate reports, predict urgency, classify categories, assign municipal departments, and formulate task resolution checklists.
3. **Smart Duplicate Check**: Evaluates semantic descriptions and geographical distance (within 150m) to identify duplicates, saving municipal resources.
4. **Community Validation Stepper**: Citizens verify reports using upvotes/downvotes and proof comments, which directly influences user reputation scores and report trust ratings.
5. **Role-Based Workstations**: Custom workspaces for Citizens (hazards mapping, daily missions), Officers (checklist tracking, status transitions, report generation), and Admins (system metrics and user logs).
6. **Gamification Engine**: Volunteer points (XP), levels, and badges (e.g., "First Responder", "Civic Guardian") to incentivize citizen engagement.
7. **Predictive AI Engine**: Suggests preemptive repairs by mapping road decay trends and water leakage hotspots.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, React Router, TanStack React Query
- **Backend**: Node.js, Express.js, TypeScript, Multer
- **Database & Auth**: Firebase Firestore, Firebase Authentication
- **Storage**: Firebase Storage
- **Generative AI**: Google Gemini API via `@google/genai` SDK

---

## ⚙️ Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 2. Installation
Run the following command at the root directory. Workspaces will automatically install and link packages for the client and server:
```bash
npm install
```

### 3. Environment Setup
Configure the backend server environment. Create a `server/.env` file based on `server/.env.example`:
```env
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

> **Note**: If `GEMINI_API_KEY` or `FIREBASE_PROJECT_ID` are left unconfigured, the application **automatically boots in local mock mode**. This allows judges to test the app out-of-the-box offline or without API configurations!

### 4. Running the App
Start both frontend and backend concurrently:
```bash
npm run dev
```
- Frontend will mount at: `http://localhost:5173`
- Backend will run at: `http://localhost:5000`

---

## 🎮 Hackathon Demo Script (Step-by-Step)

Here is a guide to demonstrate the application to judges:

1. **The Landing Page**: Show the modern dark-themed hero section, animated resolution statistics, and testimonial carousel.
2. **Fast-Track Login**: Go to the login page. Instead of filling in credentials, click the **"Citizen"** button in the Hackathon Fast-Track panel to log in instantly.
3. **Earn XP**: Note the Level 3 badge and XP bar in the navbar.
4. **multimodal Report**: Go to the **Report Issue** page.
   - Type `"Dripping water pipe causing road flooding"` as description.
   - Click **Auto-Detect Coordinates** to simulate GPS lock.
   - Attach a sample photo or record a quick audio voice note.
   - Click **Submit Report**.
   - Watch the confetti burst as the **Gemini AI Agent** returns the predicted category (`water_leakage`), estimated department (`Water Supply`), trust rating, and a 6-step checklist.
5. **Community Upvote**: Navigate to the Citizen Map. Note your new report is pinned. Click on other pins to verify them. Upvote a report to verify it and earn XP.
6. **Officer Action Desk**: Sign out, go to login, and click **"Officer"**. Note that the workspace has adjusted to show the queue of assigned water/road tasks.
7. **Resolution Stepper**: Click **Manage Case** on a report. Toggle items on the resolution checklist, write a resolution note, and click **Resolve**. The system awards +100 XP to the reporter and +150 XP to the officer!
8. **Predictive Heatmap**: Go to the **Predictive AI** tab to see where the AI forecasts road cracks or sewer collapses.
