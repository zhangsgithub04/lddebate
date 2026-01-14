'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { JudgeFeedback } from '@/types/debate';
import { Trophy, AlertCircle, CheckCircle, XCircle, Award, Target } from 'lucide-react';

interface JudgeAnalysisProps {
  feedback: JudgeFeedback;
  onNewDebate: () => void;
}

export function JudgeAnalysis({ feedback, onNewDebate }: JudgeAnalysisProps) {
  const getWinnerDisplay = () => {
    if (feedback.winner === 'human') {
      return { text: 'You Win!', color: 'text-green-500', icon: Trophy };
    } else if (feedback.winner === 'ai') {
      return { text: 'AI Wins', color: 'text-blue-500', icon: Trophy };
    } else {
      return { text: 'Tie Debate', color: 'text-yellow-500', icon: Award };
    }
  };

  const winner = getWinnerDisplay();
  const WinnerIcon = winner.icon;

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <WinnerIcon className={`w-16 h-16 ${winner.color}`} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{winner.text}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          The debate has been analyzed by the platform judge. Review the feedback below to improve your debating skills.
        </p>
      </div>

      {/* Score Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Your Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{feedback.humanScore}/100</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">AI Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{feedback.aiScore}/100</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overall Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">{feedback.overallScore}/100</div>
          </CardContent>
        </Card>
      </div>

      {/* Judge Reasoning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Judge&apos;s Decision
          </CardTitle>
          <CardDescription>Why this debate was decided this way</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{feedback.reasoning}</p>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Your Performance */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Your Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <h3 className="font-medium text-sm">Strengths</h3>
              </div>
              <ul className="space-y-1">
                {feedback.humanStrengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <h3 className="font-medium text-sm">Areas for Improvement</h3>
              </div>
              <ul className="space-y-1">
                {feedback.humanWeaknesses.map((weakness, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* AI Performance */}
        <Card className="border-secondary/30">
          <CardHeader>
            <CardTitle className="text-lg">AI Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <h3 className="font-medium text-sm">Strengths</h3>
              </div>
              <ul className="space-y-1">
                {feedback.aiStrengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <h3 className="font-medium text-sm">Weaknesses</h3>
              </div>
              <ul className="space-y-1">
                {feedback.aiWeaknesses.map((weakness, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logical Flaws */}
      {feedback.logicalFlaws.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Logical Flaws Detected
            </CardTitle>
            <CardDescription>
              These are logical fallacies or weak arguments identified during the debate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {feedback.logicalFlaws.map((flaw, idx) => (
                  <div key={idx} className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={flaw.speaker === 'human' ? 'default' : 'secondary'}>
                          {flaw.speaker === 'human' ? 'You' : 'AI'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {flaw.phase.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-destructive">{flaw.flaw}</p>
                      <p className="text-xs text-muted-foreground mt-1">{flaw.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Learning Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Strengthen Your Arguments</h3>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Support claims with specific evidence and examples</li>
                <li>Address counterarguments directly</li>
                <li>Link all points back to your value criterion</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Avoid Common Fallacies</h3>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Ad hominem attacks (attacking the person)</li>
                <li>Straw man arguments (misrepresenting opponents)</li>
                <li>False dichotomies (limiting options artificially)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={onNewDebate}>
          Start New Debate
        </Button>
      </div>
    </div>
  );
}
