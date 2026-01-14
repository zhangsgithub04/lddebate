export type DebatePhase = 
  | 'topic-selection'
  | 'side-selection'
  | 'value-criterion'
  | 'framework-strategy'
  | 'opening-human'
  | 'opening-ai'
  | 'rebuttal-human'
  | 'rebuttal-ai'
  | 'closing-human'
  | 'closing-ai'
  | 'concluded';

export type Speaker = 'human' | 'ai';

export type DebateSide = 'affirmative' | 'negative';

export type FrameworkStrategy = 'accept' | 'clash';

export interface ValueCriterion {
  value: string;
  criterion: string;
}

export interface DebateArgument {
  id: string;
  speaker: Speaker;
  phase: DebatePhase;
  content: string;
  timestamp: Date;
  timeUsed?: number; // seconds
}

export interface PhaseCompletion {
  phase: DebatePhase;
  completed: boolean;
  timeUsed?: number;
}

export interface JudgeFeedback {
  overallScore: number;
  humanScore: number;
  aiScore: number;
  humanStrengths: string[];
  humanWeaknesses: string[];
  aiStrengths: string[];
  aiWeaknesses: string[];
  logicalFlaws: Array<{
    speaker: Speaker;
    phase: DebatePhase;
    flaw: string;
    explanation: string;
  }>;
  winner: Speaker | 'tie';
  reasoning: string;
}

export interface DebateState {
  topic: string;
  humanSide: DebateSide;
  aiSide: DebateSide;
  currentPhase: DebatePhase;
  humanValue?: ValueCriterion;
  aiValue?: ValueCriterion;
  frameworkStrategy: FrameworkStrategy;
  arguments: DebateArgument[];
  phaseCompletions: PhaseCompletion[];
  isLoading: boolean;
  judgeFeedback?: JudgeFeedback;
}

export const PHASE_LABELS: Record<DebatePhase, string> = {
  'topic-selection': 'Topic Selection',
  'side-selection': 'Side Selection',
  'value-criterion': 'Value & Criterion',
  'framework-strategy': 'Framework Strategy',
  'opening-human': 'Your Opening Statement',
  'opening-ai': 'AI Opening Statement',
  'rebuttal-human': 'Your Rebuttal',
  'rebuttal-ai': 'AI Rebuttal',
  'closing-human': 'Your Closing Argument',
  'closing-ai': 'AI Closing Argument',
  'concluded': 'Debate Concluded',
};

export const PHASE_ORDER: DebatePhase[] = [
  'topic-selection',
  'side-selection',
  'value-criterion',
  'framework-strategy',
  'opening-human',
  'opening-ai',
  'rebuttal-human',
  'rebuttal-ai',
  'closing-human',
  'closing-ai',
  'concluded',
];

// Lincoln-Douglas debate time limits (in seconds)
export const PHASE_TIME_LIMITS: Partial<Record<DebatePhase, number>> = {
  'opening-human': 360, // 6 minutes for Affirmative, 7 for Negative (adjusted dynamically)
  'opening-ai': 420,    // 7 minutes for Negative, 6 for Affirmative
  'rebuttal-human': 240, // 4 minutes
  'rebuttal-ai': 240,    // 4 minutes
  'closing-human': 180,  // 3 minutes
  'closing-ai': 180,     // 3 minutes
};

// Get time limit based on phase and side
export function getPhaseTimeLimit(phase: DebatePhase, side: DebateSide): number | undefined {
  if (phase === 'opening-human' || phase === 'opening-ai') {
    // Affirmative gets 6 minutes, Negative gets 7 minutes for opening
    const isAffirmative = (phase === 'opening-human' && side === 'affirmative') ||
                          (phase === 'opening-ai' && side === 'affirmative');
    return isAffirmative ? 360 : 420;
  }
  return PHASE_TIME_LIMITS[phase];
}
