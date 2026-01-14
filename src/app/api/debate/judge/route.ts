import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DebateArgument, DebateSide, JudgeFeedback } from '@/types/debate';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { 
      topic, 
      arguments: debateArguments, 
      humanValue, 
      aiValue,
      humanSide,
      aiSide,
      frameworkStrategy
    } = await request.json();

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ 
        model:'gemini-2.5-flash'

    });

    const prompt = buildJudgePrompt(
      topic,
      debateArguments,
      humanValue,
      aiValue,
      humanSide,
      aiSide,
      frameworkStrategy
    );
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the AI response into structured feedback
    const feedback = parseJudgeFeedback(text);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error generating judge feedback:', error);
    return NextResponse.json(
      { error: 'Failed to generate judge feedback' },
      { status: 500 }
    );
  }
}

function buildJudgePrompt(
  topic: string,
  debateArguments: DebateArgument[],
  humanValue: { value: string; criterion: string },
  aiValue: { value: string; criterion: string },
  humanSide: DebateSide,
  aiSide: DebateSide,
  frameworkStrategy: string
): string {
  const debate = debateArguments
    .map(arg => {
      const speaker = arg.speaker === 'human' ? `Human (${humanSide})` : `AI (${aiSide})`;
      return `${speaker} [${arg.phase}]:\n${arg.content}`;
    })
    .join('\n\n---\n\n');

  return `You are an expert Lincoln-Douglas debate judge evaluating a completed debate. Your role is to provide EDUCATIONAL FEEDBACK to help the human debater improve, NOT to act as a competitor.

DEBATE TOPIC: "${topic}"

FRAMEWORKS:
- Human (${humanSide}): Value = ${humanValue.value}, Criterion = ${humanValue.criterion}
- AI (${aiSide}): Value = ${aiValue.value}, Criterion = ${aiValue.criterion}
- Framework Strategy: ${frameworkStrategy === 'accept' ? 'AI accepted human\'s framework' : 'AI proposed competing framework'}

FULL DEBATE TRANSCRIPT:
${debate}

As an impartial judge and educator, provide comprehensive feedback in this EXACT JSON format:

{
  "overallScore": <number 1-100>,
  "humanScore": <number 1-100>,
  "aiScore": <number 1-100>,
  "humanStrengths": ["strength 1", "strength 2", "strength 3"],
  "humanWeaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "aiStrengths": ["strength 1", "strength 2", "strength 3"],
  "aiWeaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "logicalFlaws": [
    {
      "speaker": "human" or "ai",
      "phase": "phase name",
      "flaw": "Name of logical fallacy or flaw",
      "explanation": "Clear explanation of why this is problematic"
    }
  ],
  "winner": "human" or "ai" or "tie",
  "reasoning": "2-3 sentences explaining the decision based on: (1) who better achieved their value through their criterion, (2) quality of argumentation, (3) effectiveness of rebuttals, (4) framework debate if applicable"
}

JUDGING CRITERIA:
1. Framework adherence - Did they achieve their stated value through their criterion?
2. Logical consistency and evidence quality
3. Effective rebuttals and clash
4. Clear, structured argumentation
5. Addressing opponent's key points

Be fair, educational, and specific. Identify actual logical fallacies (ad hominem, straw man, false dichotomy, slippery slope, appeal to emotion, hasty generalization, etc.) when present.

Return ONLY the JSON, no other text.`;
}

function parseJudgeFeedback(text: string): JudgeFeedback {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if parsing fails
    throw new Error('Could not parse judge feedback');
  } catch (error) {
    console.error('Error parsing judge feedback:', error);
    // Return default feedback structure
    return {
      overallScore: 75,
      humanScore: 70,
      aiScore: 80,
      humanStrengths: [
        'Presented clear arguments',
        'Attempted to address key points',
        'Maintained respectful tone'
      ],
      humanWeaknesses: [
        'Could provide more specific evidence',
        'Some arguments could be more developed',
        'Framework connection could be stronger'
      ],
      aiStrengths: [
        'Strong logical structure',
        'Good use of examples',
        'Effective rebuttals'
      ],
      aiWeaknesses: [
        'Some points could be more concise',
        'Occasionally repetitive',
        'Could engage more with framework'
      ],
      logicalFlaws: [],
      winner: 'tie',
      reasoning: 'Both debaters presented valid arguments with room for improvement. The debate was closely contested with strong points on both sides.'
    };
  }
}
