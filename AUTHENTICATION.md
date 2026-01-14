# Douglas Debate Platform - Authentication & Session Management

## New Features

### User Authentication
- **Sign Up**: Create an account with first name, last name, email, and password
- **Registration Secret**: Required for signup (configured in `.env.local`)
- **Sign In**: Login with email and password
- **Session Management**: JWT-based authentication with secure cookies

### Debate Session Storage
- **Auto-Save**: Debates are automatically saved to MongoDB when completed
- **Past Debates**: View all your previous debate sessions
- **Session Viewer**: Review complete debate transcripts with judge feedback
- **No Re-Run**: All arguments and feedback are stored, no need to regenerate AI responses

## Environment Variables

Add to `.env.local`:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lincolndouglasdebate

# Registration Secret (users need this to sign up)
REGISTRATION_SECRETE_KEY=your-secret-key

# JWT Secret (for authentication tokens)
JWT_SECRET=your-jwt-secret-key-change-in-production
```

## Database Collections

### users
- `firstName`: string
- `lastName`: string
- `email`: string (unique)
- `password`: string (bcrypt hashed)
- `createdAt`: Date

### debate_sessions
- `userId`: string (reference to user)
- `topic`: string
- `humanSide`: 'affirmative' | 'negative'
- `aiSide`: 'affirmative' | 'negative'
- `humanValue`: { value, criterion }
- `aiValue`: { value, criterion }
- `frameworkStrategy`: 'accept' | 'clash'
- `arguments`: Array of all debate arguments
- `judgeFeedback`: Complete judge analysis
- `createdAt`: Date
- `completedAt`: Date (when judge analysis completed)

## Usage Flow

1. **First Time**: Sign up with registration secret
2. **Return Visits**: Sign in with email/password
3. **New Debate**: Click "New Debate" button
4. **Past Debates**: Click "Past Debates" to review previous sessions
5. **Auto-Save**: Debates save automatically when you request judge analysis

## Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- HTTP-only cookies prevent XSS attacks
- Registration secret prevents unauthorized signups
- User isolation: Can only view own debates

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Debate Sessions
- `POST /api/debate-sessions` - Save debate session
- `GET /api/debate-sessions` - List user's sessions
- `GET /api/debate-sessions/[id]` - Get specific session
