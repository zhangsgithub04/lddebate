'use client';

import { useState, useCallback } from 'react';
import { DebateState, DebateArgument, PHASE_ORDER, DebateSide, DebatePhase } from '@/types/debate';
import { generateAIResponse } from '@/lib/ai-debater';
import { requestJudgeFeedback } from '@/lib/judge-feedback';

const INITIAL_STATE: DebateState = {
  topic: '',
  humanSide: 'affirmative',
  aiSide: 'negative',
  currentPhase: 'topic-selection',
  frameworkStrategy: 'accept',
  arguments: [],
  phaseCompletions: [],
  isLoading: false,
};

export function useDebate() {
  const [state, setState] = useState<DebateState>(INITIAL_STATE);

  // Judge feedback is now manually triggered, not automatic
  const requestJudge = useCallback(async () => {
    if (!state.humanValue || !state.aiValue) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const feedback = await requestJudgeFeedback(
        state.topic,
        state.arguments,
        state.humanValue!,
        state.aiValue!,
        state.humanSide,
        state.aiSide,
        state.frameworkStrategy
      );
      setState(prev => ({
        ...prev,
        currentPhase: 'concluded',
        judgeFeedback: feedback,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error getting judge feedback:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.topic, state.arguments, state.humanValue, state.aiValue, state.humanSide, state.aiSide, state.frameworkStrategy]);

  const setTopic = useCallback((topic: string) => {
    setState(prev => ({
      ...prev,
      topic,
      currentPhase: 'side-selection',
    }));
  }, []);

  const setSide = useCallback((side: DebateSide) => {
    setState(prev => ({
      ...prev,
      humanSide: side,
      aiSide: side === 'affirmative' ? 'negative' : 'affirmative',
      currentPhase: 'value-criterion',
    }));
  }, []);

  const setValueCriterion = useCallback(async (value: string, criterion: string) => {
    setState(prev => ({
      ...prev,
      humanValue: { value, criterion },
      currentPhase: 'framework-strategy',
      isLoading: false,
    }));
  }, []);

  const getFirstOpeningPhase = (humanSide: DebateSide): DebatePhase => {
    // Affirmative always goes first
    return humanSide === 'affirmative' ? 'opening-human' : 'opening-ai';
  };

  const setFrameworkStrategy = useCallback(async (strategy: 'accept' | 'clash') => {
    setState(prev => ({
      ...prev,
      frameworkStrategy: strategy,
      isLoading: true,
    }));

    // Generate AI's value and criterion based on strategy
    try {
      const firstPhase = getFirstOpeningPhase(state.humanSide);
      const aiGoesFirst = firstPhase === 'opening-ai';
      
      if (strategy === 'accept') {
        // AI accepts human's framework
        setState(prev => ({
          ...prev,
          aiValue: prev.humanValue,
          currentPhase: firstPhase,
          isLoading: aiGoesFirst, // Keep loading if AI goes first
        }));
        
        // If AI goes first, generate opening statement immediately
        if (aiGoesFirst) {
          const aiOpening = await generateAIResponse(
            state.topic,
            'opening-ai',
            [],
            state.humanValue,
            state.humanValue, // AI accepted human's framework
            state.humanSide,
            state.aiSide,
            'accept'
          );

          const aiArgument: DebateArgument = {
            id: Date.now().toString(),
            speaker: 'ai',
            phase: 'opening-ai',
            content: aiOpening,
            timestamp: new Date(),
          };

          const aiPhaseCompletion = {
            phase: 'opening-ai' as DebatePhase,
            completed: true,
          };

          setState(prev => ({
            ...prev,
            arguments: [aiArgument],
            phaseCompletions: [aiPhaseCompletion],
            currentPhase: 'opening-human',
            isLoading: false,
          }));
        }
      } else {
        // AI proposes competing framework
        const aiValueCriterion = await generateAIResponse(
          state.topic,
          'value-criterion',
          [],
          state.humanValue,
          undefined,
          state.humanSide,
          state.aiSide
        );

        // Parse AI response for value and criterion
        const lines = aiValueCriterion.split('\n').filter(l => l.trim());
        const aiValue = lines.find(l => l.toLowerCase().includes('value:'))?.split(':')[1]?.trim() || 'Justice';
        const aiCriterion = lines.find(l => l.toLowerCase().includes('criterion:') || l.toLowerCase().includes('standard:'))?.split(':')[1]?.trim() || 'Maximizing social welfare';

        setState(prev => ({
          ...prev,
          aiValue: { value: aiValue, criterion: aiCriterion },
          currentPhase: firstPhase,
          isLoading: aiGoesFirst, // Keep loading if AI goes first
        }));
        
        // If AI goes first, generate opening statement immediately
        if (aiGoesFirst) {
          const aiOpening = await generateAIResponse(
            state.topic,
            'opening-ai',
            [],
            state.humanValue,
            { value: aiValue, criterion: aiCriterion },
            state.humanSide,
            state.aiSide,
            'clash'
          );

          const aiArgument: DebateArgument = {
            id: Date.now().toString(),
            speaker: 'ai',
            phase: 'opening-ai',
            content: aiOpening,
            timestamp: new Date(),
          };

          const aiPhaseCompletion = {
            phase: 'opening-ai' as DebatePhase,
            completed: true,
          };

          setState(prev => ({
            ...prev,
            arguments: [aiArgument],
            phaseCompletions: [aiPhaseCompletion],
            currentPhase: 'opening-human',
            isLoading: false,
          }));
        }
      }
    } catch (error) {
      console.error('Error generating AI value/criterion:', error);
      
      // Check if it's a quota error
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('quota')) {
        // Show quota error to user
        alert('⚠️ API Quota Exceeded\n\nYou have reached the free tier limit (20 requests/day). Please:\n\n1. Wait until tomorrow for quota reset\n2. Use a different API key in .env.local\n3. Upgrade to a paid plan\n\nThe debate cannot continue without AI responses.');
        
        setState(prev => ({
          ...prev,
          currentPhase: 'topic-selection',
          isLoading: false,
        }));
        return;
      }
      
      // Fallback AI values for other errors
      setState(prev => ({
        ...prev,
        aiValue: { 
          value: 'Social Welfare', 
          criterion: 'Maximizing overall well-being and happiness for the greatest number of people' 
        },
        currentPhase: getFirstOpeningPhase(prev.humanSide),
        isLoading: false,
      }));
    }
  }, [state.topic, state.humanValue, state.humanSide, state.aiSide]);

  const submitArgument = useCallback(async (content: string, timeUsed?: number) => {
    if (!content.trim()) return;

    const newArgument: DebateArgument = {
      id: Date.now().toString(),
      speaker: 'human',
      phase: state.currentPhase,
      content: content.trim(),
      timestamp: new Date(),
      timeUsed,
    };

    // Mark current phase as completed
    const phaseCompletion = {
      phase: state.currentPhase,
      completed: true,
      timeUsed,
    };

    setState(prev => ({
      ...prev,
      arguments: [...prev.arguments, newArgument],
      phaseCompletions: [...prev.phaseCompletions, phaseCompletion],
      isLoading: true,
    }));

    // Move to next phase
    const currentIndex = PHASE_ORDER.indexOf(state.currentPhase);
    const nextPhase = PHASE_ORDER[currentIndex + 1];

    // If next phase is AI's turn, generate response
    if (nextPhase && nextPhase.includes('ai')) {
      try {
        const aiResponse = await generateAIResponse(
          state.topic,
          nextPhase,
          [...state.arguments, newArgument],
          state.humanValue,
          state.aiValue,
          state.humanSide,
          state.aiSide,
          state.frameworkStrategy
        );

        const aiArgument: DebateArgument = {
          id: (Date.now() + 1).toString(),
          speaker: 'ai',
          phase: nextPhase,
          content: aiResponse,
          timestamp: new Date(),
        };

        // Mark AI phase as completed
        const aiPhaseCompletion = {
          phase: nextPhase,
          completed: true,
        };

        const afterAIPhase = PHASE_ORDER[currentIndex + 2];
        
        // Don't auto-conclude - let user trigger judge analysis
        const finalPhase = afterAIPhase === 'concluded' ? nextPhase : afterAIPhase;

        setState(prev => ({
          ...prev,
          arguments: [...prev.arguments, aiArgument],
          phaseCompletions: [...prev.phaseCompletions, aiPhaseCompletion],
          currentPhase: finalPhase,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Error generating AI response:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    } else {
      // Don't auto-conclude - stay on current phase if next would be concluded
      const finalNextPhase = nextPhase === 'concluded' ? state.currentPhase : (nextPhase || state.currentPhase);
      
      setState(prev => ({
        ...prev,
        currentPhase: finalNextPhase,
        isLoading: false,
      }));
    }
  }, [state.currentPhase, state.topic, state.arguments, state.humanValue, state.aiValue, state.humanSide, state.aiSide, state.frameworkStrategy]);

  const isPhaseCompleted = useCallback((phase: DebatePhase): boolean => {
    return state.phaseCompletions.some(pc => pc.phase === phase && pc.completed);
  }, [state.phaseCompletions]);

  const resetDebate = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    setTopic,
    setSide,
    setValueCriterion,
    setFrameworkStrategy,
    submitArgument,
    isPhaseCompleted,
    requestJudge,
    resetDebate,
  };
}
