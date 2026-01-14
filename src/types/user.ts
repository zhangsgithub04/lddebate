export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // hashed
  createdAt: Date;
}

export interface DebateSession {
  _id?: string;
  userId: string;
  topic: string;
  humanSide: 'affirmative' | 'negative';
  aiSide: 'affirmative' | 'negative';
  humanValue: {
    value: string;
    criterion: string;
  };
  aiValue: {
    value: string;
    criterion: string;
  };
  frameworkStrategy: 'accept' | 'clash';
  arguments: Array<{
    id: string;
    speaker: 'human' | 'ai';
    phase: string;
    content: string;
    timestamp: string;
    timeUsed?: number;
  }>;
  judgeFeedback?: {
    overallScore: number;
    humanScore: number;
    aiScore: number;
    humanStrengths: string[];
    humanWeaknesses: string[];
    aiStrengths: string[];
    aiWeaknesses: string[];
    logicalFlaws: Array<{
      speaker: 'human' | 'ai';
      phase: string;
      flaw: string;
      explanation: string;
    }>;
    winner: 'human' | 'ai' | 'tie';
    reasoning: string;
  };
  createdAt: Date;
  completedAt?: Date;
}
