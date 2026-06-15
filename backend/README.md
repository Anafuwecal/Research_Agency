# INSIGHT-GRAPH - Backend

Express.js backend API server implementing multi-agent research orchestration with LangChain and LangGraph.

## Overview

The backend service provides RESTful API endpoints for research session management, implements Firebase authentication, orchestrates AI agents through LangGraph workflows, and manages real-time communication via Server-Sent Events.

## Architecture

### Components

**API Layer**
- Express.js REST endpoints
- Firebase authentication middleware
- Server-Sent Events streaming
- CORS and security middleware

**Agent System**
- Research Planner: Strategic question generation
- Web Researcher: Information gathering and synthesis
- Data Extractor: Key insight identification
- Synthesizer: Comprehensive analysis creation
- Report Generator: Professional report formatting

**Data Layer**
- Firestore for persistent storage
- In-memory session management
- Research history tracking

## Technology Stack

- Node.js 18+
- Express.js 4.x
- TypeScript 5.x
- LangChain 0.3+
- LangGraph 0.2+
- Firebase Admin SDK
- Groq SDK
- Axios
- Cheerio

## Installation

```bash
npm install
```

### Configuration

#### Environment Variables

Create `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
PORT=3000
NODE_ENV=development
```

#### Firebase Setup

Download service account key from Firebase Console (Settings → Service Accounts → Generate new private key) and save as `serviceAccountKey.json` in the backend root directory.

## Directory Structure

```
backend/
├── src/
│   ├── agents/
│   │   ├── planner.ts              # Research planning agent
│   │   ├── researcher.ts           # Web research agent
│   │   ├── extractor.ts            # Data extraction agent
│   │   ├── summarizer.ts           # Synthesis agent
│   │   └── reportGenerator.ts      # Report generation agent
│   ├── config/
│   │   └── firebase.ts             # Firebase configuration
│   ├── middleware/
│   │   └── auth.ts                 # Authentication middleware
│   ├── routes/
│   │   └── research.ts             # Research API routes
│   ├── types/
│   │   └── index.ts                # TypeScript definitions
│   └── server.ts                   # Main application file
├── .env                            # Environment configuration
├── serviceAccountKey.json          # Firebase credentials
├── package.json
└── tsconfig.json
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Server starts on: `http://localhost:3000`

### Production Mode

```bash
npm run build
npm start
```
## API Endpoints

### POST /api/research

Start new research session.

**Headers:**

```
Authorization: Bearer <firebase-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "topic": "Research topic",
  "agents": ["planner", "researcher", "extractor", "summarizer", "reporter"]
}
```

**Response:**

```json
{
  "id": "research_1234567890_abc",
  "status": "started"
}
```

### GET /api/research/:id

Get research session status and results.

**Headers:**

```
Authorization: Bearer <firebase-token>
```

**Response:**

```json
{
  "id": "research_1234567890_abc",
  "topic": "Research topic",
  "status": "completed",
  "progress": 100,
  "plan": [],
  "searchResults": [],
  "extractedData": [],
  "summary": "...",
  "report": "...",
  "startTime": 1234567890,
  "endTime": 1234567900,
  "userId": "user123",
  "agents": []
}
```

### GET /api/research/:id/stream

Server-Sent Events stream for real-time progress updates.

**Headers:**

```
Authorization: Bearer <firebase-token>
```

**Stream Format:**

```
data: {"status":"planning","currentStep":"Creating research plan...","progress":20}
data: {"status":"researching","currentStep":"Searching web sources...","progress":40}
```

### GET /api/research/history

Get user's research history.

**Headers:**

```
Authorization: Bearer <firebase-token>
```

**Response:**

```json
[
  {
    "id": "research_1234567890_abc",
    "topic": "Research topic",
    "status": "completed",
    "createdAt": 1234567890,
    "completedAt": 1234567900,
    "agents": []
  }
]
```

### DELETE /api/research/:id

Delete research session.

**Headers:**

```
Authorization: Bearer <firebase-token>
```

**Response:**

```json
{
  "success": true
}
```

### GET /api/health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "groqKey": true,
  "firebase": true
}
```
## Agent System

### Agent Workflow

1. **Planner Agent** - Analyzes topic and generates strategic research questions
2. **Researcher Agent** - Searches web sources and synthesizes findings
3. **Extractor Agent** - Identifies and extracts key insights from research
4. **Synthesizer Agent** - Creates comprehensive analysis from extracted data
5. **Report Generator** - Produces professional formatted report

### Selective Execution

Agents can be selectively executed based on requirements:
- **Full pipeline** - All agents in sequence
- **Partial pipeline** - Subset of agents
- **Single agent** - Individual agent execution

### Agent Configuration

Each agent can be configured through:
- System prompts (defined in agent files)
- Model parameters (temperature, tokens, etc.)
- Processing parameters (timeouts, retries, etc.)

## Authentication

Firebase JWT token authentication is required for all research endpoints.

### Token Verification

Middleware validates tokens and extracts user ID:

```typescript
const decodedToken = await auth.verifyIdToken(token);
const userId = decodedToken.uid;
```

### Error Responses

- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User does not own resource
- `404 Not Found` - Resource does not exist
## Data Persistence

### Firestore Collections

**research** - Research session documents
- Document ID: Research session ID
- Fields: All research state data
- Indexed by: userId, startTime

### Data Access Patterns

- **Create** - New research session
- **Read** - Session status and results
- **Update** - Progress updates during execution
- **Delete** - Session cleanup

## Error Handling

All errors are caught and returned with appropriate HTTP status codes:

- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication failure
- `403 Forbidden` - Authorization failure
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server errors
## Development

### Adding New Agents

1. Create agent file in `src/agents/`
2. Implement agent function with state parameter
3. Export agent function
4. Add to workflow in `routes/research.ts`

### Modifying Agent Prompts

Edit system prompts in respective agent files:

```typescript
const AGENT_SYSTEM_PROMPT = `Your prompt here...`;
```

### Debugging

Enable verbose logging:

```typescript
console.log('Debug info:', data);
```

View logs in terminal running the development server.

## Testing

```bash
npm test
```

## Building

```bash
npm run build
```

Output in `dist/` directory.

## Deployment

1. Build production bundle
2. Set environment variables
3. Upload `serviceAccountKey.json`
4. Start server

## Performance Considerations

- Agent execution is sequential
- SSE connections maintained per session
- Firestore queries indexed by userId
- Rate limiting handled by LLM provider

## Security

- All endpoints require authentication
- User data isolated by userId
- Service account credentials secured
- CORS configured for frontend origin
- Input validation on all endpoints

## Troubleshooting

### Firebase Connection Issues

Check `serviceAccountKey.json` is present and valid.

### Groq API Errors

Verify API key and check rate limits.

### Agent Execution Failures

Review agent logs and LLM responses.

## License

MIT License - See LICENSE file.

Copyright (c) 2024. All rights reserved.