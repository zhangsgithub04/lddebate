# Douglas Debate Platform

A Next.js application for engaging in structured Douglas-style debates with an AI opponent.

## Features

- 🎯 **Structured Debate Format**: Follow the classical Lincoln-Douglas debate structure
  - Side selection (Affirmative or Negative)
  - Value and Criterion framework establishment
  - Framework strategy (Accept or Clash)
  - Opening statements
  - Rebuttals
  - Closing arguments
- 🤖 **AI Opponent**: Debate against an intelligent AI that responds contextually
- ⚖️ **Framework Clash**: Choose whether AI accepts your framework or proposes its own
- 🎤 **Voice Input**: Speak your arguments using your microphone
- 🔊 **AI Voice Output**: Listen to AI responses with text-to-speech
- 💬 **Real-time Interaction**: Smooth, turn-based debate experience
- 📊 **Debate History**: Track all arguments throughout the debate
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

Dependencies are already installed. To reinstall:

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Debate Structure

The Lincoln-Douglas debate format follows these phases:

1. **Topic Selection**: Choose from suggested topics or create your own
2. **Side Selection**: Choose Affirmative (supporting) or Negative (opposing)
3. **Value & Criterion**: Establish your philosophical framework
   - **Value**: The core principle (e.g., Justice, Morality, Freedom)
   - **Criterion**: How to measure/achieve that value
4. **Framework Strategy**: AI chooses to:
   - **Accept**: Use your framework and argue they win under it
   - **Clash**: Propose their own competing framework
5. **Opening Statements**: Affirmative goes first, followed by Negative
6. **Rebuttals**: Respond to opponent's opening statements
7. **Closing Arguments**: Final summary and persuasive appeal
8. **Conclusion**: Debate ends with full history preserved

### Framework Clash Explained

This is a key strategic element in Lincoln-Douglas debate:

- **Accept Framework**: The AI accepts your value and criterion, making the debate focus purely on which side better achieves your stated goal. This is often used when:
  - The framework is strong and hard to challenge
  - The debater is confident they can win under the opponent's framework
  - Time management favors focusing on substantive arguments

- **Clash Framework**: The AI proposes a competing value and criterion, creating a framework debate. This adds complexity because:
  - You must defend why your framework is better
  - The debate includes both framework evaluation AND substantive arguments
  - More realistic to competitive LD debate
  - Tests your ability to handle multiple layers of argumentation

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: lucide-react

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main debate page with phase routing
│   ├── globals.css         # Global styles
│   └── api/
│       └── debate/
│           └── ai-response/
│               └── route.ts       # AI response API endpoint
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── debate/
│       ├── TopicSelector.tsx           # Topic selection interface
│       ├── SideSelector.tsx            # Affirmative/Negative selection
│       ├── ValueCriterionSelector.tsx  # Framework establishment
│       ├── FrameworkStrategySelector.tsx # Accept/Clash choice
│       ├── DebateInterface.tsx         # Main debate interface
│       ├── ArgumentCard.tsx            # Individual argument display
│       ├── VoiceControls.tsx           # Microphone/speaker controls
│       └── VoiceSettings.tsx           # Voice selection dialog
├── hooks/
│   ├── use-debate.ts                # Debate state management
│   ├── use-speech-recognition.ts    # Voice input hook
│   └── use-speech-synthesis.ts      # Voice output hook
├── lib/
│   ├── utils.ts            # Utility functions
│   └── ai-debater.ts       # AI response generation
└── types/
    └── debate.ts           # TypeScript type definitions
```

## AI Integration

The platform uses **Google Gemini AI** (gemini-2.5-flash model) as the debate opponent. The AI generates contextual responses based on:
- The debate topic
- Your side (Affirmative or Negative)
- Your value and criterion framework
- Framework strategy (Accept or Clash)
- Current debate phase (opening, rebuttal, closing)
- All previous arguments in the debate

The AI is context-aware and will:
- Argue consistently from its assigned side
- Reference and defend (or attack) frameworks appropriately
- Build on previous arguments
- Adapt strategy based on whether it accepted or clashed with your framework

### Configuration

The Google API key is configured in `.env.local`:

```env
GOOGLE_API_KEY=your_api_key_here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### How It Works

1. User submits an argument
2. Request sent to `/api/debate/ai-response`
3. Google Gemini generates contextual response
4. AI response displayed in debate interface

The system includes fallback responses if the API fails.

## Voice Features

The platform includes full voice integration using the Web Speech API:

### Voice Input (Speech-to-Text)
- Click the microphone button to start recording your argument
- Speak naturally - the system will transcribe in real-time
- Click "Stop Recording" when finished
- Your transcript appears in the text area and can be edited before submitting

### Voice Output (Text-to-Speech)
- AI responses are automatically spoken aloud
- Click the speaker icon to toggle AI voice on/off
- Click "Stop AI Speaking" to interrupt the AI mid-speech
- The system waits for the AI to finish generating before speaking
- **Automatic voice selection**: Prioritizes high-quality natural voices (Premium, Enhanced, Google, Microsoft)
- **Natural speech patterns**: Adds appropriate pauses for sentences, paragraphs, and punctuation
- **Optimized parameters**: Slightly slower rate (0.95x) and softer volume for natural feel

### Improving Voice Quality

The platform automatically selects the best available voice on your system. For better quality:

**Browser-based (Free)**:
- **Chrome/Edge**: Usually has high-quality Google voices
- **Safari**: Premium voices on macOS sound more natural
- **Firefox**: Limited to system voices

**For Professional Quality**:
Consider integrating premium TTS services:
- **Google Cloud Text-to-Speech**: WaveNet and Neural2 voices
- **Amazon Polly**: Neural voices
- **Microsoft Azure Speech**: Neural voices
- **ElevenLabs**: Ultra-realistic AI voices

To integrate premium TTS:
1. Create an API route for your chosen service
2. Replace the `speak` function in `use-speech-synthesis.ts`
3. Stream audio back to the browser

### Browser Compatibility
Voice features require a modern browser:
- **Chrome/Edge**: Full support for speech recognition and synthesis
- **Safari**: Limited speech recognition support
- **Firefox**: Text-to-speech only

If voice features aren't supported, the platform gracefully falls back to text-only mode.

## Customization

### Adding More Debate Topics

Edit `src/components/debate/TopicSelector.tsx` and modify the `SUGGESTED_TOPICS` array.

### Modifying Debate Phases

Update the `PHASE_ORDER` array in `src/types/debate.ts` to customize the debate structure.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
