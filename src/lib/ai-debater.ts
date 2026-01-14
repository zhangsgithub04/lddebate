import { DebatePhase, DebateArgument, ValueCriterion, DebateSide, FrameworkStrategy } from '@/types/debate';

/**
 * Generate AI response for debate using Google Gemini API
 */
export async function generateAIResponse(
  topic: string,
  phase: DebatePhase,
  previousArguments: DebateArgument[],
  humanValue?: ValueCriterion,
  aiValue?: ValueCriterion,
  humanSide?: DebateSide,
  aiSide?: DebateSide,
  frameworkStrategy?: FrameworkStrategy
): Promise<string> {
  try {
    const response = await fetch('/api/debate/ai-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        topic, 
        phase, 
        previousArguments, 
        humanValue, 
        aiValue,
        humanSide,
        aiSide,
        frameworkStrategy
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle quota exceeded specifically
      if (response.status === 429) {
        throw new Error(errorData.message || 'API quota exceeded. Please try again later or use a different API key.');
      }
      
      throw new Error(errorData.details || errorData.error || 'Failed to generate AI response');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error fetching AI response:', error);
    
    // Re-throw quota errors so they can be displayed to user
    if (error instanceof Error && error.message.includes('quota')) {
      throw error;
    }
    
    // Fallback to simulated response for other errors
    return getFallbackResponse(topic, phase);
  }
}

/**
 * Fallback response if API fails
 */
function getFallbackResponse(topic: string, phase: DebatePhase): string {
  switch (phase) {
    case 'opening-ai':
      return generateOpeningStatement(topic);
    case 'rebuttal-ai':
      return generateRebuttal(topic);
    case 'closing-ai':
      return generateClosingArgument(topic);
    default:
      return 'I am ready to debate.';
  }
}

function generateOpeningStatement(topic: string): string {
  const statements = [
    `Thank you for this opportunity to discuss "${topic}". I believe this is a nuanced issue that requires careful consideration of multiple perspectives. Let me present my position clearly and methodically.

First, it's important to acknowledge the complexity inherent in this topic. While there are strong arguments on various sides, I will argue that when we examine the evidence objectively and consider both short-term and long-term implications, a particular stance becomes more defensible.

The core of my argument rests on three fundamental pillars: empirical evidence, logical consistency, and practical outcomes. Each of these supports the position I will defend throughout this debate.`,
    
    `I appreciate the chance to engage in this intellectual discourse on "${topic}". This subject matter touches on fundamental questions that deserve rigorous examination and thoughtful analysis.

My opening position is grounded in both theoretical frameworks and real-world observations. When we strip away emotional appeals and focus on substantive reasoning, certain conclusions become increasingly evident.

I will structure my argument around key principles: the weight of available evidence, the logical implications of different positions, and the practical consequences of policy or belief choices. These elements collectively support my thesis.`,
  ];
  
  return statements[Math.floor(Math.random() * statements.length)];
}

function generateRebuttal(topic: string, /* opponentArgument: string */): string {
  return `I've carefully considered the points raised, and while I respect the perspective presented, I must respectfully disagree with several key elements of that argument.

First, the reasoning presented overlooks certain critical factors that fundamentally alter the analysis. When we examine the issue more deeply, we find that the conclusions drawn are not as straightforward as suggested.

Second, there are alternative interpretations of the evidence that lead to very different conclusions. The framework being applied may be too narrow to capture the full complexity of "${topic}".

Furthermore, the practical implications of the position taken could lead to unintended consequences that haven't been fully addressed. We must consider not just the immediate effects, but also the longer-term ramifications.

Let me elaborate on these points with more specific analysis...`;
}

function generateClosingArgument(topic: string, /* allArguments: DebateArgument[] */): string {
  return `As we conclude this debate on "${topic}", I want to summarize the key points that have emerged from our discussion.

Throughout this exchange, I have consistently demonstrated that my position is supported by logical reasoning, empirical evidence, and consideration of practical outcomes. While my opponent has raised interesting points, they ultimately do not undermine the fundamental strength of my argument.

The core thesis I presented in my opening statement remains valid: when we examine this issue objectively and consider all relevant factors, the position I've advocated for proves to be the most defensible.

I've addressed the counterarguments raised, showing how they either rely on faulty premises or fail to account for critical considerations. The weight of evidence and logic supports my conclusions.

In closing, I urge consideration of the broader implications of this debate and recognition that the position I've defended offers the most coherent and well-supported approach to "${topic}".

Thank you for this engaging intellectual exchange.`;
}
