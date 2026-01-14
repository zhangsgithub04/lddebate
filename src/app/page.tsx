'use client';

import { useDebate } from '@/hooks/use-debate';
import { TopicSelector } from '@/components/debate/TopicSelector';
import { SideSelector } from '@/components/debate/SideSelector';
import { ValueCriterionSelector } from '@/components/debate/ValueCriterionSelector';
import { FrameworkStrategySelector } from '@/components/debate/FrameworkStrategySelector';
import { DebateInterface } from '@/components/debate/DebateInterface';
import { JudgeAnalysis } from '@/components/debate/JudgeAnalysis';

export default function Home() {
  const { 
    state, 
    setTopic, 
    setSide, 
    setValueCriterion, 
    setFrameworkStrategy,
    submitArgument,
    isPhaseCompleted,
    requestJudge,
    resetDebate 
  } = useDebate();

  if (state.currentPhase === 'topic-selection') {
    return <TopicSelector onTopicSelect={setTopic} />;
  }

  if (state.currentPhase === 'side-selection') {
    return (
      <SideSelector
        topic={state.topic}
        onSideSelect={setSide}
      />
    );
  }

  if (state.currentPhase === 'value-criterion') {
    return (
      <ValueCriterionSelector
        topic={state.topic}
        onSubmit={setValueCriterion}
        onBack={resetDebate}
      />
    );
  }

  if (state.currentPhase === 'framework-strategy') {
    return (
      <FrameworkStrategySelector
        topic={state.topic}
        humanValue={state.humanValue!}
        onStrategySelect={setFrameworkStrategy}
        isLoading={state.isLoading}
      />
    );
  }

  // Show judge analysis when debate is concluded and feedback is ready
  if (state.currentPhase === 'concluded' && state.judgeFeedback) {
    return (
      <JudgeAnalysis
        feedback={state.judgeFeedback}
        onNewDebate={resetDebate}
      />
    );
  }

  return (
    <DebateInterface
      state={state}
      onSubmitArgument={submitArgument}
      onRequestJudge={requestJudge}
      onReset={resetDebate}
      isPhaseCompleted={isPhaseCompleted}
    />
  );
}
