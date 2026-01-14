import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DebatePhase, DebateArgument } from '@/types/debate';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { 
      topic, 
      phase, 
      previousArguments, 
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

    const prompt = buildPrompt(
      topic, 
      phase, 
      previousArguments, 
      humanValue, 
      aiValue, 
      humanSide, 
      aiSide,
      frameworkStrategy
    );
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error: unknown) {
    console.error('Error generating AI response:', error);
    
    const err = error as { status?: number; message?: string; errorDetails?: Array<Record<string, unknown>> };
    
    // Handle quota exceeded error
    if (err?.status === 429 || err?.message?.includes('quota')) {
      return NextResponse.json(
        { 
          error: 'API quota exceeded', 
          message: 'You have exceeded the free tier API quota (20 requests/day). Please try again tomorrow or use a different API key.',
          retryAfter: err?.errorDetails?.[0]?.['@type'] && typeof err.errorDetails[0]['@type'] === 'string' && err.errorDetails[0]['@type'].includes('RetryInfo') ? 'later' : undefined
        },
        { status: 429 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate AI response', details: errorMessage },
      { status: 500 }
    );
  }
}

function buildPrompt(
  topic: string,
  phase: DebatePhase,
  previousArguments: DebateArgument[],
  humanValue?: { value: string; criterion: string },
  aiValue?: { value: string; criterion: string },
  humanSide?: string,
  aiSide?: string,
  frameworkStrategy?: string
): string {
  const context = previousArguments
    .map(arg => `${arg.speaker === 'human' ? 'Human' : 'AI'}: ${arg.content}`)
    .join('\n\n');

  const sideContext = aiSide && humanSide ? `

DEBATE POSITIONS:
You are the ${aiSide.toUpperCase()} side.
Your opponent is the ${humanSide.toUpperCase()} side.
${aiSide === 'affirmative' ? 'You must SUPPORT the resolution.' : 'You must OPPOSE the resolution.'}
` : '';

  const valueContext = humanValue && aiValue ? `

DEBATE FRAMEWORK:
Your Value: ${aiValue.value}
Your Criterion: ${aiValue.criterion}

Opponent's Value: ${humanValue.value}
Opponent's Criterion: ${humanValue.criterion}

${frameworkStrategy === 'accept' 
  ? `IMPORTANT: You have ACCEPTED your opponent's framework. You share the same value and criterion. Your job is to prove that YOUR side (${aiSide}) better achieves this shared framework than their side.`
  : `You are arguing under your own framework. Address why your framework is superior or more relevant while still engaging with your opponent's framework.`}
` : '';

  switch (phase) {
    case 'value-criterion':
      return `You are participating in a formal Lincoln-Douglas debate on the topic: "${topic}"
${sideContext}
You are the ${aiSide?.toUpperCase()} side. Your opponent has established their framework with:
- Value: ${humanValue?.value}
- Criterion: ${humanValue?.criterion}

Generate YOUR OWN competing Value and Value Criterion. This will be a framework clash. Choose a different value and criterion that better supports the ${aiSide} position on this topic.

Format your response EXACTLY as:

Value: [Your chosen value - should be different from "${humanValue?.value}"]
Criterion: [Your measuring standard - one clear sentence explaining how to achieve/measure this value]

Be philosophical and strategic. Your framework should give you an advantage in this debate.`;

    case 'opening-ai':
      return `You are participating in a formal Lincoln-Douglas debate on the topic: "${topic}"
${sideContext}
${valueContext}

This is your OPENING STATEMENT. Present a clear, well-structured argument for the ${aiSide?.toUpperCase()} position. Include:
1. Reference your value and criterion (${frameworkStrategy === 'accept' ? 'which you accepted from your opponent' : 'and explain why it\'s the right framework'})
2. A clear thesis statement supporting the ${aiSide} side
3. 2-3 main supporting points that link back to your criterion
4. Logical reasoning and examples
5. A brief conclusion

${aiSide === 'affirmative' 
  ? 'As Affirmative, you have the burden of proof to show why the resolution should be upheld.' 
  : 'As Negative, show why the resolution should be rejected or why the Affirmative fails.'}

Keep it focused and under 300 words. Be persuasive but respectful.`;

    case 'rebuttal-ai':
      return `You are participating in a formal Lincoln-Douglas debate on the topic: "${topic}"
${sideContext}
${valueContext}

This is your REBUTTAL. The ${humanSide?.toUpperCase()} opponent has presented their opening statement:

${context}

Now respond by:
1. ${frameworkStrategy === 'accept' 
     ? `Since you accepted their framework, show how your ${aiSide} position BETTER achieves the shared value of "${aiValue?.value}" through the criterion` 
     : 'Address how their arguments fail under BOTH frameworks - theirs and yours'}
2. Respectfully disagree and explain why through your value lens
3. Strengthen your own ${aiSide} position
4. Show why your side wins the debate
5. Provide counter-evidence or alternative perspectives

Keep it focused and under 300 words. Be analytical and constructive.`;

    case 'closing-ai':
      return `You are participating in a formal Lincoln-Douglas debate on the topic: "${topic}"
${sideContext}
${valueContext}

This is your CLOSING ARGUMENT. Here's the debate history:

${context}

Now conclude by:
1. Reaffirming your value and criterion ${frameworkStrategy === 'accept' ? '(the shared framework)' : ''}
2. Summarizing how your ${aiSide?.toUpperCase()} arguments uphold your framework
3. ${frameworkStrategy === 'accept'
     ? `Explaining why you better achieved the shared value of "${aiValue?.value}"`
     : 'Explaining why your criterion better evaluates this debate'}
4. Addressing the opponent's key objections through your value lens
5. Making a final persuasive appeal for the ${aiSide} side
6. Ending with a memorable conclusion

Keep it focused and under 300 words. Be confident but gracious.`;

    default:
      return `Discuss the topic: "${topic}"`;
  }
}
