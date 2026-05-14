# Research Report Agent

A comprehensive AI-powered research and report generation system built with Vue 3, TypeScript, LangChain, and LangGraph. This enterprise-grade application automates the research process through intelligent agent orchestration, combining natural language processing, web search capabilities, and advanced synthesis techniques to produce professional research reports.

## Key Features

- **Multi-Agent Architecture** - Specialized agents for planning, research, extraction, synthesis, and reporting
- **User Authentication** - Secure Firebase-based authentication and session management
- **Selective Execution** - Flexible agent selection for customized research workflows
- **Real-Time Monitoring** - Server-Sent Events for live progress tracking
- **Multiple Export Formats** - DOCX and Markdown export capabilities
- **Research History** - Persistent storage and retrieval of past research sessions
- **Professional Output** - Publication-quality reports with structured formatting

## System Architecture

┌─────────────────────────────────────────────────────────────┐
│ Frontend Layer │
│ (Vue 3 + TypeScript) │
│ Authentication | Research Interface | Report Viewer │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ API Layer │
│ (Express.js + REST) │
│ Authentication | Research Routes | SSE Streaming │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ Agent Orchestration │
│ (LangGraph) │
│ Planner → Researcher → Extractor → Synthesizer → Reporter │
└─────────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────────┐
│ External Services │
│ Groq (LLM) | Firebase (Auth/DB) | DuckDuckGo (Search) │
└─────────────────────────────────────────────────────────────┘


## Technology Stack

### Frontend
- Vue 3 - Progressive JavaScript framework
- TypeScript - Static type checking
- Vite - Build tool and development server
- Tailwind CSS - Utility-first CSS framework
- Firebase SDK - Client-side authentication
- Axios - HTTP client
- docx - Word document generation
- file-saver - Client-side file downloads

### Backend
- Node.js - JavaScript runtime environment
- Express.js - Web application framework
- TypeScript - Type-safe development
- LangChain - Large Language Model framework
- LangGraph - Agent orchestration framework
- Groq - Fast LLM inference
- Firebase Admin - Server-side authentication and Firestore
- Axios - HTTP requests
- Cheerio - HTML parsing and web scraping

### Infrastructure
- Firebase Authentication - User management
- Firestore - NoSQL document database
- Groq API - LLM inference service
- DuckDuckGo API - Web search functionality

## Prerequisites

- Node.js version 18.0.0 or higher
- npm or yarn package manager
- Firebase project with Authentication and Firestore enabled
- Groq API account and API key

## Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/research-report-agent.git
cd research-report-agent
```

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:

```env
GROQ_API_KEY=your_groq_api_key
PORT=3000
NODE_ENV=development
```

Download Firebase service account key from Firebase Console (Settings → Service Accounts → Generate new private key) and save as `serviceAccountKey.json` in the backend directory.

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Running the Application

### Development Mode

**Terminal 1 - Backend**:

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:

```bash
cd frontend
npm run dev
```

Access the application at: `http://localhost:5173`

### Production Build

**Backend**:

```bash
cd backend
npm run build
npm start
```

**Frontend**:

```bash
cd frontend
npm run build
npm run preview
```

## Project Structure

ResearchReportAgent/
├── backend/                     # Backend API server
│   ├── src/
│   │   ├── agents/             # AI agent implementations
│   │   ├── config/             # Configuration files
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API route handlers
│   │   ├── types/              # TypeScript type definitions
│   │   └── server.ts           # Main server file
│   ├── .env                    # Environment variables
│   ├── serviceAccountKey.json  # Firebase credentials
│   └── package.json
│
├── research-report-ui/         # Frontend application
│   ├── src/
│   │   ├── components/         # Vue components
│   │   ├── composables/        # Vue composition functions
│   │   ├── config/             # Configuration
│   │   ├── api/                # API client
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Utility functions
│   │   └── App.vue             # Root component
│   ├── .env                    # Environment variables
│   └── package.json
│
├── .gitignore
└── README.md

## Usage Guide

### Authentication

Users must create an account or sign in before accessing research functionality. Authentication is handled through Firebase Authentication with email/password credentials.

### Starting Research

1. Enter research topic with appropriate specificity
2. Select agents for execution:
   - All agents for comprehensive research
   - Subset of agents for targeted analysis
   - Individual agents for specific tasks
3. Initiate research process

### Monitoring Progress

Real-time progress updates display:
- Current agent activity
- Completion percentage
- Estimated time remaining
- Step-by-step execution details

### Exporting Reports

Reports can be exported in multiple formats:
- **DOCX** - Microsoft Word format with professional formatting
- **Markdown** - Plain text with markdown syntax
- **Clipboard** - Direct copy for immediate use

### Research History

All research sessions are automatically saved and can be:
- Viewed in chronological order
- Loaded for review
- Used as reference for future research

## API Documentation

### Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer <firebase-id-token>
```

### Endpoints

#### POST /api/research

Initiates new research session.

**Request:**

```json
{
  "topic": "string",
  "agents": ["planner", "researcher", "extractor", "summarizer", "reporter"]
}
```

**Response:**

```json
{
  "id": "string",
  "status": "started"
}
```

#### GET /api/research/:id

Retrieves research session details.

**Response:**

```json
{
  "id": "string",
  "topic": "string",
  "status": "completed",
  "progress": 100,
  "plan": [],
  "report": "string"
}
```

#### GET /api/research/:id/stream

Server-Sent Events stream for real-time updates.

#### GET /api/research/history

Retrieves user's research history.

#### DELETE /api/research/:id

Deletes research session.

## Configuration

### Environment Variables

**Backend:**
- `GROQ_API_KEY` - Groq API authentication key
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode

**Frontend:**
- `VITE_API_URL` - Backend API endpoint
- `VITE_FIREBASE_*` - Firebase configuration parameters

### Agent Configuration

Agent behavior can be customized by modifying system prompts in respective agent files under `backend/src/agents/`.

### Model Selection

LLM model can be changed in agent files:

```typescript
const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.3,
  apiKey: process.env.GROQ_API_KEY,
});
```

## Troubleshooting

### Backend Issues

**Firebase Authentication Error**
- Verify `serviceAccountKey.json` is present and valid
- Check Firebase project configuration
- Ensure Firestore is enabled

**Groq API Errors**
- Verify API key validity
- Check rate limits
- Review request format

### Frontend Issues

**Authentication Failures**
- Verify Firebase configuration in `.env`
- Clear browser cache and localStorage
- Check network connectivity

**Build Errors**
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Verify Node.js version compatibility
- Check TypeScript configuration

## Development

### Code Standards

- Use TypeScript for all new code
- Follow existing code patterns and conventions
- Include comprehensive comments for complex logic
- Use meaningful variable and function names

### Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Building

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Implement changes with appropriate tests
4. Submit pull request with detailed description

See `CONTRIBUTING.md` for detailed guidelines.

## License

This project is licensed under the MIT License. See `LICENSE` file for details.

## Support

For issues, questions, or contributions:

- **GitHub Issues** - https://github.com/yourusername/research-report-agent/issues
- **Documentation** - https://github.com/yourusername/research-report-agent/wiki

## Acknowledgments

- LangChain team for the LLM framework
- Groq for fast inference capabilities
- Firebase for authentication and database services
- Vue.js team for the frontend framework
- Tailwind CSS for the styling framework

---

Copyright (c) 2024. All rights reserved.