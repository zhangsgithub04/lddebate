'use client';

import { useState } from 'react';
import { useDebate } from '@/hooks/use-debate';
import { useAuth } from '@/contexts/AuthContext';
import { TopicSelector } from '@/components/debate/TopicSelector';
import { SideSelector } from '@/components/debate/SideSelector';
import { ValueCriterionSelector } from '@/components/debate/ValueCriterionSelector';
import { FrameworkStrategySelector } from '@/components/debate/FrameworkStrategySelector';
import { DebateInterface } from '@/components/debate/DebateInterface';
import { JudgeAnalysis } from '@/components/debate/JudgeAnalysis';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { PastDebates } from '@/components/debate/PastDebates';
import { SessionViewer } from '@/components/debate/SessionViewer';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { DebateSession } from '@/types/user';

type View = 'debate' | 'past-debates' | 'session-viewer' | 'admin';
type AuthView = 'login' | 'signup';

export default function Home() {
  const { user, isLoading: authLoading, login, logout } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [view, setView] = useState<View>('debate');
  const [selectedSession, setSelectedSession] = useState<DebateSession | null>(null);
  
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    if (authView === 'login') {
      return (
        <LoginForm
          onSuccess={login}
          onSwitchToSignup={() => setAuthView('signup')}
        />
      );
    } else {
      return (
        <SignupForm
          onSuccess={login}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
  }

  // User navigation header
  const UserHeader = () => (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold">SUNY IITG</h1>
            <p className="text-xs text-muted-foreground">Douglas Debate Platform</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={view === 'debate' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setView('debate');
                resetDebate();
              }}
            >
              New Debate
            </Button>
            <Button
              variant={view === 'past-debates' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('past-debates')}
            >
              Past Debates
            </Button>
            {user.isAdmin && (
              <Button
                variant={view === 'admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('admin')}
              >
                Admin
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user.firstName} {user.lastName}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );

  if (view === 'admin') {
    return (
      <>
        <UserHeader />
        <AdminDashboard onBack={() => setView('debate')} />
      </>
    );
  }

  if (view === 'past-debates') {
    return (
      <>
        <UserHeader />
        <PastDebates
          onBack={() => setView('debate')}
          onViewSession={(session) => {
            setSelectedSession(session);
            setView('session-viewer');
          }}
        />
      </>
    );
  }

  if (view === 'session-viewer' && selectedSession) {
    return (
      <>
        <UserHeader />
        <SessionViewer
          session={selectedSession}
          onBack={() => setView('past-debates')}
        />
      </>
    );
  }

  // Debate flow
  if (state.currentPhase === 'topic-selection') {
    return (
      <>
        <UserHeader />
        <TopicSelector onTopicSelect={setTopic} />
      </>
    );
  }

  if (state.currentPhase === 'side-selection') {
    return (
      <>
        <UserHeader />
        <SideSelector
          topic={state.topic}
          onSideSelect={setSide}
        />
      </>
    );
  }

  if (state.currentPhase === 'value-criterion') {
    return (
      <>
        <UserHeader />
        <ValueCriterionSelector
          topic={state.topic}
          onSubmit={setValueCriterion}
          onBack={resetDebate}
        />
      </>
    );
  }

  if (state.currentPhase === 'framework-strategy') {
    return (
      <>
        <UserHeader />
        <FrameworkStrategySelector
          topic={state.topic}
          humanValue={state.humanValue!}
          onStrategySelect={setFrameworkStrategy}
          isLoading={state.isLoading}
        />
      </>
    );
  }

  // Show judge analysis when debate is concluded and feedback is ready
  if (state.currentPhase === 'concluded' && state.judgeFeedback) {
    return (
      <>
        <UserHeader />
        <JudgeAnalysis
          feedback={state.judgeFeedback}
          onNewDebate={resetDebate}
        />
      </>
    );
  }

  return (
    <>
      <UserHeader />
      <DebateInterface
        state={state}
        onSubmitArgument={submitArgument}
        onRequestJudge={requestJudge}
        onReset={resetDebate}
        isPhaseCompleted={isPhaseCompleted}
      />
    </>
  );
}
