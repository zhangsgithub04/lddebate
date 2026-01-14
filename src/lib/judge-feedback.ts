import { DebateArgument, JudgeFeedback, ValueCriterion } from '@/types/debate';

export async function requestJudgeFeedback(
  topic: string,
  debateArguments: DebateArgument[],
  humanValue: ValueCriterion,
  aiValue: ValueCriterion,
  humanSide: string,
  aiSide: string,
  frameworkStrategy: string
): Promise<JudgeFeedback> {
  const response = await fetch('/api/debate/judge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      arguments: debateArguments,
      humanValue,
      aiValue,
      humanSide,
      aiSide,
      frameworkStrategy,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get judge feedback');
  }

  const data = await response.json();
  return data.feedback;
}
