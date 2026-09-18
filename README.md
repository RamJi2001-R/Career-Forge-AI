<div align="center">

# CareerForge AI

### AI-Powered Career Preparation Platform

Turn your resume into your career advantage. Analyze it against any job description, close your skill gaps, and walk into your next interview prepared — all powered by Google Gemini AI.

[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)

[Live Demo](https://career-forge-ai-sage.vercel.app/) · [Report Bug](#) · [Request Feature](#)

</div>

---

## Overview

CareerForge AI is a full-stack SaaS platform that helps students and job seekers understand exactly how well their resume matches a job — and what to do about it. Upload a resume, paste a job description, and get an AI-generated match score, ATS compatibility score, skill gap breakdown, tailored interview questions, and a resume optimization report, all in seconds.

Built as a production-style MERN application with a scalable backend architecture, JWT authentication, and a fully custom-designed responsive UI.

## Screenshots

<div align="center">
<table>
<tr>
<td><img src="./docs/screenshots/Landing_page" alt="Landing page" width="400"/></td>
<td><img src="./docs/screenshots/Dashboard_page" alt="Dashboard" width="400"/></td>
</tr>
<tr>
<td align="center"><em>Landing Page</em></td>
<td align="center"><em>Dashboard</em></td>
</tr>
<tr>
<td><img src="./docs/screenshots/Report_page" alt="Analysis report" width="400"/></td>
<td><img src="./docs/screenshots/Interview_prep" alt="Interview preparation" width="400"/></td>
</tr>
<tr>
<td align="center"><em>Resume Analysis Report</em></td>
<td align="center"><em>Interview Preparation</em></td>
</tr>
</table>
</div>


## Features

| Feature | Description |
|---|---|
| **Resume Analysis** | Upload a PDF/DOCX resume and get an AI-generated match score against any job description |
| **ATS Score & Optimizer** | See how ATS-friendly your resume is, with missing keywords and rewritten bullet points |
| **AI Skill Gap Detection** | Missing skills ranked by priority (High/Medium/Low), each with a learning recommendation |
| **Interview Preparation** | Technical, HR, behavioral, and project-based questions generated from your actual resume and the job |
| **PDF Reports** | Download a full analysis report or an ATS optimization report as a polished PDF |
| **Career Progress Tracking** | Profile page with resume history, average/best match scores, and a progress chart over time |
| **Secure Authentication** | JWT-based auth with protected routes and hashed passwords (bcrypt) |

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS (custom design tokens, no UI library)
- React Router
- Axios

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT authentication + bcrypt
- Multer (file uploads) · pdf-parse / mammoth (resume text extraction)
- Puppeteer (PDF report generation)

**AI**
- Google Gemini API (`gemini-3.6-flash`) for resume analysis, skill gap detection, interview question generation, and ATS optimization

## Architecture

```
Frontend (React + Vite)  ──axios──▶  Backend (Express API)
                                            │
                                            ├──▶ MongoDB (users, resumes, analysis reports)
                                            ├──▶ Google Gemini API (AI analysis)
                                            └──▶ Puppeteer (PDF generation)
```

The backend follows a layered architecture:

```
routes/         → defines API endpoints
controllers/    → handles requests, orchestrates services
services/       → business logic (AI calls, resume parsing, PDF generation)
models/         → MongoDB schemas (Mongoose)
middleware/     → JWT auth guard, file upload handling
```

## Folder Structure

```
careerforge-ai/
├── backend/
│   ├── config/           # MongoDB connection
│   ├── controllers/      # Request handlers (auth, resume, reports)
│   ├── middleware/       # JWT auth guard, multer upload config
│   ├── models/           # User, Resume, AnalysisReport schemas
│   ├── routes/           # Auth & resume API routes
│   ├── services/         # aiService (Gemini), resumeParserService, pdfService
│   ├── server.js
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/           # Axios instance with JWT interceptor
    │   ├── components/    # Reusable components (ProtectedRoute, etc.)
    │   ├── context/        # AuthContext (global login state)
    │   ├── pages/          # Landing, Dashboard, Analyzer, Report, SkillGap,
    │   │                    InterviewPrep, AtsOptimizer, Profile, Login, Register
    │   └── App.jsx
    └── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- A free [Gemini API key](https://aistudio.google.com/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/careerforge-ai.git
cd careerforge-ai
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see [Environment Variables](#environment-variables) below), then:

```bash
npm run dev
```

The API will run on `http://localhost:5000`.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app will run on `http://localhost:5173`.

## Environment Variables

Create a `backend/.env` file with the following:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret_string
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
```

> Never commit your `.env` file. It is already excluded via `.gitignore`.

## API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Log in and receive a JWT | Public |
| `GET` | `/api/auth/me` | Get the logged-in user's profile | Private |
| `POST` | `/api/resume/analyze` | Upload resume + job description, get AI analysis | Private |
| `GET` | `/api/resume/reports` | Get all of the user's past reports | Private |
| `GET` | `/api/resume/reports/:id` | Get a single report by ID | Private |
| `GET` | `/api/resume/reports/:id/pdf` | Download the full report as a PDF | Private |
| `GET` | `/api/resume/reports/:id/skill-gap` | Get prioritized skill gap analysis | Private |
| `GET` | `/api/resume/reports/:id/interview-prep` | Get generated interview questions | Private |
| `GET` | `/api/resume/reports/:id/ats-optimize` | Get ATS optimization suggestions | Private |
| `GET` | `/api/resume/reports/:id/ats-optimize/pdf` | Download the ATS optimization report as a PDF | Private |
| `GET` | `/api/resume/profile-stats` | Get resume history and career progress stats | Private |

All private routes require an `Authorization: Bearer <token>` header.

## Roadmap

- [x] JWT authentication with protected routes
- [x] Resume upload and AI-powered job match analysis
- [x] Dashboard with analysis history
- [x] AI skill gap detection with priority ranking
- [x] AI-generated interview preparation
- [x] ATS resume optimizer with downloadable PDF
- [x] Full report PDF export
- [x] Profile page with career progress tracking
- [x] Landing page
- [ ] Full resume rewrite/export as a polished PDF resume
- [ ] Email notifications for analysis completion
- [ ] Multi-resume comparison against a single job description

## License

This project is licensed under the MIT License.

## Author

Built by **Ram Ji**
[Portfolio](https://my-portfolio-ten-gules-68.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/ram-ji-bhardwaj-8a82a7329/) · [GitHub](https://github.com/RamJi2001-R)
