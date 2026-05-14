
# Research Report Agent - Frontend

Vue 3 frontend application providing user interface for AI-powered research and report generation.

## Overview

The frontend application delivers a professional user interface for research session management, real-time progress monitoring, and report visualization. Built with Vue 3 and TypeScript, it implements Firebase authentication, responsive design, and comprehensive export capabilities.

## Technology Stack

- **Vue 3.5+** - Progressive JavaScript framework
- **TypeScript 5+** - Static type checking
- **Vite 6+** - Build tool and development server
- **Tailwind CSS 3+** - Utility-first CSS framework
- **Firebase SDK 10+** - Client authentication
- **Axios** - HTTP client library
- **docx** - Word document generation
- **file-saver** - Client-side downloads

## Installation

```bash
npm install
```

### Configuration

Create `.env` file in project root:

```env
VITE_API_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Obtain Firebase configuration from Firebase Console → Project Settings → General → Your apps → Web app

## Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.vue           # Login component
│   │   │   └── SignupForm.vue          # Registration component
│   │   ├── layout/
│   │   │   └── AppHeader.vue           # Application header
│   │   ├── research/
│   │   │   ├── AgentSelector.vue       # Agent selection interface
│   │   │   ├── ResearchForm.vue        # Research initiation form
│   │   │   ├── ProgressTracker.vue     # Progress monitoring
│   │   │   ├── ReportViewer.vue        # Report display
│   │   │   └── ResearchHistory.vue     # History browser
│   │   └── ui/
│   │       └── LoadingSpinner.vue      # Loading indicator
│   ├── composables/
│   │   ├── useAuth.ts                  # Authentication logic
│   │   └── useResearch.ts              # Research management
│   ├── config/
│   │   └── firebase.ts                 # Firebase configuration
│   ├── api/
│   │   └── research.ts                 # API client
│   ├── types/
│   │   └── index.ts                    # TypeScript definitions
│   ├── utils/
│   │   └── exportDocx.ts               # DOCX export utility
│   ├── App.vue                         # Root component
│   ├── main.ts                         # Application entry
│   └── style.css                       # Global styles
├── public/
├── index.html
├── .env
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## Running the Application

### Development Server

```bash
npm run dev
```

Application available at: `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```
## Features

### Authentication

Firebase Authentication implementation with:
- Email/password registration
- Secure login
- Session persistence
- Automatic token refresh
- Protected routes

### Research Interface

Comprehensive research management:
- Topic input with validation
- Agent selection interface
- Real-time progress tracking
- Result visualization
- Export capabilities

### Agent Selection

Flexible agent configuration:
- Individual agent selection
- Full pipeline execution
- Custom workflow creation
- Dependency validation

### Progress Monitoring

Real-time status updates via Server-Sent Events:
- Current agent activity
- Completion percentage
- Step descriptions
- Duration tracking

### Report Viewing

Professional report display:
- Rendered markdown view
- Raw markdown view
- Syntax highlighting
- Responsive layout
- Reading statistics

### Export Functionality

Multiple export formats:
- **DOCX** - Microsoft Word format with professional formatting
- **Markdown** - Plain text with markdown syntax
- **Clipboard** - Direct copy for immediate use
- **Share** - Share functionality

### Research History

Persistent session management:
- Chronological listing
- Session metadata
- Quick loading
- Search capability
## Components

### Authentication Components

**LoginForm.vue**
- Email/password input
- Validation
- Error handling
- Navigation to signup

**SignupForm.vue**
- Registration form
- Password confirmation
- Validation rules
- Navigation to login

### Research Components

**ResearchForm.vue**
- Topic textarea
- Agent selector integration
- Example topics
- Submission handling

**AgentSelector.vue**
- Agent cards
- Selection logic
- Dependency management
- Visual feedback

**ProgressTracker.vue**
- Progress bar
- Step indicators
- Status badges
- Duration display

**ReportViewer.vue**
- Markdown rendering
- View mode toggle
- Export dropdown
- Statistics display

**ResearchHistory.vue**
- History list
- Session cards
- Load functionality
- Empty state

### Layout Components

**AppHeader.vue**
- Application branding
- User menu
- Logout functionality
- Responsive design

### UI Components

**LoadingSpinner.vue**
- Animated spinner
- Loading text
- Centered layout
## Composables

### useAuth

Authentication state management:

```typescript
const {
  user,         // Current user object
  loading,      // Loading state
  error,        // Error message
  login,        // Login function
  signup,       // Signup function
  logout        // Logout function
} = useAuth();
```

### useResearch

Research session management:

```typescript
const {
  state,        // Current research state
  loading,      // Loading indicator
  error,        // Error message
  start,        // Start research
  loadResearch, // Load existing research
  reset         // Reset state
} = useResearch();
```
## API Integration

### HTTP Client

Axios instance with authentication headers:

```typescript
const headers = await getAuthHeaders();
const response = await axios.get(url, { headers });
```

### Server-Sent Events

Real-time progress updates:

```typescript
const unsubscribe = subscribeToProgress(
  id,
  (update) => { /* Handle update */ },
  (error) => { /* Handle error */ }
);
```
## Styling

### Tailwind Configuration

Custom color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        dark: '#252523',
        light: '#34302d',
      },
      accent: {
        gold: '#D4AF37',
        blue: '#4A9EFF',
        green: '#10B981',
        red: '#EF4444',
        purple: '#A855F7',
      }
    }
  }
}
```

### Custom CSS Classes

Utility classes defined in `style.css`:
- `.card` - Card container
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.input-field` - Text input
- `.textarea-field` - Textarea input

## Type System

TypeScript interfaces for type safety:

```typescript
interface ResearchState {
  id: string;
  topic: string;
  status: ResearchStatus;
  progress: number;
  report: string;
  // ...
}
```

## Error Handling

Comprehensive error management:
- API error interception
- User-friendly messages
- Error state display
- Retry mechanisms

## Development

### Code Organization

- Components in feature folders
- Composables for shared logic
- Types in centralized location
- Utils for helper functions

### State Management

Composables pattern for reactive state:
- Local component state
- Shared composable state
- No global store required

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

### Building

**Production build:**

```bash
npm run build
```

Output in `dist/` directory.

**Preview build:**

```bash
npm run preview
```

## Deployment

1. Build production bundle
2. Configure environment variables
3. Deploy to hosting service
4. Update API URL if needed

## Performance

### Optimization Strategies

- Code splitting by route
- Lazy component loading
- Asset optimization
- Tree shaking
- Minification

### Bundle Size

Monitor bundle size:

```bash
npm run build -- --report
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## Troubleshooting

### Build Errors

Clear cache and reinstall:

```bash
rm -rf node_modules
npm install
```

### Authentication Issues

Clear browser data:
- LocalStorage
- SessionStorage
- Cookies

### SSE Connection Problems

Check network tab for connection status and verify CORS configuration.

## License

MIT License - See LICENSE file.

Copyright (c) 2024. All rights reserved.