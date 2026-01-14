'use client';

import { useState, useEffect } from 'react';
import { DebateState, DebatePhase, PHASE_LABELS, getPhaseTimeLimit } from '@/types/debate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArgumentCard } from './ArgumentCard';
import { DebateTimer } from './DebateTimer';
import { VoiceControls } from './VoiceControls';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface DebateInterfaceProps {
  state: DebateState;
  onSubmitArgument: (content: string, timeUsed?: number) => void;
  onRequestJudge: () => void;
  onReset: () => void;
  isPhaseCompleted?: (phase: DebatePhase) => boolean;
}

export function DebateInterface({ state, onSubmitArgument, onRequestJudge, onReset, isPhaseCompleted: _isPhaseCompleted }: DebateInterfaceProps) {
  const [currentArgument, setCurrentArgument] = useState('');
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [phaseStartTime, setPhaseStartTime] = useState<number>(0);
  const [hasSubmittedThisPhase, setHasSubmittedThisPhase] = useState(false);
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported: isRecognitionSupported 
  } = useSpeechRecognition();
  
  const { 
    speak, 
    cancel: cancelSpeech, 
    isSpeaking,
    isSupported: isSynthesisSupported,
    voices,
    selectedVoice,
    setSelectedVoice,
  } = useSpeechSynthesis();

  // Update currentArgument when transcript changes during listening
  useEffect(() => {
    if (isListening && transcript) {
      // Use queueMicrotask to avoid setState during render warning
      queueMicrotask(() => {
        setCurrentArgument(transcript);
      });
    }
  }, [isListening, transcript]);

  // Reset timer when phase changes
  useEffect(() => {
    queueMicrotask(() => {
      setPhaseStartTime(Date.now());
      setHasSubmittedThisPhase(false);
    });
  }, [state.currentPhase]);

  // Speak AI responses when they arrive
  useEffect(() => {
    const lastArgument = state.arguments[state.arguments.length - 1];
    
    if (lastArgument && 
        lastArgument.speaker === 'ai' && 
        speechEnabled && 
        isSynthesisSupported &&
        !state.isLoading) {
      // Small delay to ensure UI updates first
      setTimeout(() => {
        speak(lastArgument.content).catch(err => {
          console.error('Speech synthesis error:', err);
        });
      }, 500);
    }
  }, [state.arguments, speechEnabled, isSynthesisSupported, speak, state.isLoading]);

  const handleSubmit = () => {
    if (currentArgument.trim() && !state.isLoading && !hasSubmittedThisPhase) {
      if (isListening) {
        stopListening();
      }
      cancelSpeech();
      
      // Calculate time used
      const timeUsed = Math.floor((Date.now() - phaseStartTime) / 1000);
      
      setHasSubmittedThisPhase(true);
      onSubmitArgument(currentArgument, timeUsed);
      setCurrentArgument('');
      resetTranscript();
    }
  };

  const handleStopListening = () => {
    stopListening();
  };

  const handleToggleSpeech = () => {
    if (speechEnabled && isSpeaking) {
      cancelSpeech();
    }
    setSpeechEnabled(!speechEnabled);
  };

  const isHumanTurn = state.currentPhase.includes('human');
  const isConcluded = state.currentPhase === 'concluded';
  
  // Check if all debate rounds are complete (last phase before judge analysis)
  const allRoundsComplete = state.arguments.some(arg => arg.phase === 'closing-ai');
  const canRequestJudge = allRoundsComplete && !isConcluded && !state.isLoading && !isSpeaking;
  
  const canSubmit = isHumanTurn && !state.isLoading && !hasSubmittedThisPhase && currentArgument.trim().length > 0;
  
  // Get time limit for current phase
  const timeLimit = getPhaseTimeLimit(state.currentPhase, state.humanSide);

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Debate in Progress</h1>
          <p className="text-muted-foreground">{state.topic}</p>
        </div>
        <Button variant="outline" onClick={onReset}>
          New Debate
        </Button>
      </div>

      {/* Progress Indicator & Timer */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Current Phase</CardTitle>
              <Badge variant={isConcluded ? 'secondary' : isHumanTurn ? 'default' : 'outline'} className="text-sm">
                {PHASE_LABELS[state.currentPhase]}
              </Badge>
            </div>
            {!isConcluded && (
              <CardDescription className="flex items-center gap-2 mt-2">
                {isHumanTurn ? (
                  <>
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Your turn to speak
                  </>
                ) : state.isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    AI is preparing response...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Phase completed
                  </>
                )}
              </CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Timer - only show for human speech phases */}
        {timeLimit && isHumanTurn && !hasSubmittedThisPhase && (
          <DebateTimer
            timeLimit={timeLimit}
            onTimeUp={() => {
              // Optional: Auto-submit or warn user
              console.warn('Time is up for this phase');
            }}
            autoStart={true}
            showControls={true}
          />
        )}
      </div>

      {/* Values and Criteria Display */}
      {state.humanValue && state.aiValue && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="default">
                  Your Framework ({state.humanSide === 'affirmative' ? 'Affirmative' : 'Negative'})
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Value</p>
                <p className="text-sm font-semibold">{state.humanValue.value}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Criterion</p>
                <p className="text-sm">{state.humanValue.criterion}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="secondary">
                  AI Framework ({state.aiSide === 'affirmative' ? 'Affirmative' : 'Negative'})
                </Badge>
                {state.frameworkStrategy === 'accept' && (
                  <Badge variant="outline" className="text-xs">Accepted Your Framework</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Value</p>
                <p className="text-sm font-semibold">{state.aiValue.value}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Criterion</p>
                <p className="text-sm">{state.aiValue.criterion}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}


      <div className="grid gap-6 lg:grid-cols-2">
        {/* Arguments History */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Debate History</CardTitle>
            <CardDescription>
              {state.arguments.length} argument{state.arguments.length !== 1 ? 's' : ''} exchanged
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {state.arguments.map((argument) => (
                  <ArgumentCard key={argument.id} argument={argument} />
                ))}
                {state.isLoading && (
                  <Card className="bg-secondary/5 border-secondary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          AI is formulating response...
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {state.arguments.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No arguments yet. Start with your opening statement!
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Input Area */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>
              {isConcluded ? 'Debate Concluded' : 'Your Argument'}
            </CardTitle>
            <CardDescription>
              {isConcluded
                ? 'The debate has concluded. Start a new debate to continue.'
                : isHumanTurn
                ? 'Present your argument clearly and thoughtfully'
                : 'Waiting for AI response...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConcluded && (
              <>
                {/* Voice Controls */}
                {(isRecognitionSupported || isSynthesisSupported) && (
                  <VoiceControls
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    onStartListening={startListening}
                    onStopListening={handleStopListening}
                    onStopSpeaking={cancelSpeech}
                    transcript={transcript}
                    disabled={!isHumanTurn || state.isLoading}
                    speechEnabled={speechEnabled}
                    onToggleSpeech={handleToggleSpeech}
                    voices={voices}
                    selectedVoice={selectedVoice}
                    onVoiceSelect={setSelectedVoice}
                  />
                )}

                <Textarea
                  placeholder={
                    isHumanTurn
                      ? 'Type your argument here or use voice input...'
                      : 'Please wait for the AI to respond...'
                  }
                  value={currentArgument}
                  onChange={(e) => setCurrentArgument(e.target.value)}
                  disabled={!isHumanTurn || state.isLoading || isListening}
                  className="min-h-[250px] resize-none"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full"
                  size="lg"
                >
                  {state.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : hasSubmittedThisPhase ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submitted - Waiting for AI
                    </>
                  ) : (
                    'Submit Argument'
                  )}
                </Button>
              </>
            )}

            {/* Judge Analysis Button - shown after all rounds complete and speech finished */}
            {canRequestJudge && (
              <div className="space-y-4">
                <Separator />
                <div className="text-center py-6 space-y-4">
                  <p className="text-base font-medium">
                    All debate rounds are complete!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ready to receive judge feedback and analysis on your performance.
                  </p>
                  <Button 
                    onClick={onRequestJudge} 
                    size="lg"
                    className="w-full"
                  >
                    Get Judge Analysis
                  </Button>
                </div>
              </div>
            )}

            {isConcluded && (
              <div className="space-y-4">
                <Separator />
                <div className="text-center py-8 space-y-4">
                  <p className="text-lg font-medium">
                    Thank you for participating in this debate!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The Douglas debate format helps structure constructive discourse.
                    Review the arguments above and reflect on both perspectives.
                  </p>
                  <Button onClick={onReset} size="lg">
                    Start New Debate
                  </Button>
                </div>
              </div>
            )}

            {!isConcluded && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Tips for Effective Debating</h3>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Support your claims with logical reasoning</li>
                    <li>Address your opponent&apos;s key points directly</li>
                    <li>Stay focused on the topic</li>
                    <li>Be respectful and constructive</li>
                    <li>Build on previous arguments</li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
