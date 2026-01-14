'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { DebateSession } from '@/types/user';
import { PHASE_LABELS } from '@/types/debate';
import { ArgumentCard } from './ArgumentCard';

interface SessionViewerProps {
  session: DebateSession;
  onBack: () => void;
}

export function SessionViewer({ session, onBack }: SessionViewerProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Button variant="outline" size="sm" onClick={onBack} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Saved Debate</h1>
          <p className="text-muted-foreground">{session.topic}</p>
          <p className="text-sm text-muted-foreground">{formatDate(session.createdAt.toString())}</p>
        </div>
      </div>

      {/* Framework Display */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="default">
                Your Framework ({session.humanSide === 'affirmative' ? 'Affirmative' : 'Negative'})
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Value</p>
              <p className="text-sm font-semibold">{session.humanValue.value}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Criterion</p>
              <p className="text-sm">{session.humanValue.criterion}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="secondary">
                AI Framework ({session.aiSide === 'affirmative' ? 'Affirmative' : 'Negative'})
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Value</p>
              <p className="text-sm font-semibold">{session.aiValue.value}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Criterion</p>
              <p className="text-sm">{session.aiValue.criterion}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Strategy</p>
              <Badge variant="outline" className="text-xs">
                {session.frameworkStrategy === 'accept' ? 'Accept Framework' : 'Clash on Framework'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Arguments */}
      <Card>
        <CardHeader>
          <CardTitle>Debate History</CardTitle>
          <CardDescription>{session.arguments.length} arguments exchanged</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {session.arguments.map((arg) => (
                <ArgumentCard
                  key={arg.id}
                  argument={{
                    ...arg,
                    timestamp: new Date(arg.timestamp),
                    phase: arg.phase as keyof typeof PHASE_LABELS,
                  }}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Judge Feedback */}
      {session.judgeFeedback && (
        <Card>
          <CardHeader>
            <CardTitle>Judge&apos;s Analysis</CardTitle>
            <CardDescription>Educational feedback on your performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Your Score</CardDescription>
                  <CardTitle className="text-3xl">{session.judgeFeedback.humanScore}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>AI Score</CardDescription>
                  <CardTitle className="text-3xl">{session.judgeFeedback.aiScore}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Winner</CardDescription>
                  <CardTitle>
                    <Badge variant={
                      session.judgeFeedback.winner === 'human' ? 'default' :
                      session.judgeFeedback.winner === 'ai' ? 'secondary' : 'outline'
                    } className="text-base">
                      {session.judgeFeedback.winner === 'human' ? 'You' :
                       session.judgeFeedback.winner === 'ai' ? 'AI' : 'Tie'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Your Performance</h3>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-green-600">✓ Strengths</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    {session.judgeFeedback.humanStrengths.map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-orange-600">⚠ Areas for Improvement</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    {session.judgeFeedback.humanWeaknesses.map((weakness, i) => (
                      <li key={i}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">AI Performance</h3>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-green-600">✓ Strengths</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    {session.judgeFeedback.aiStrengths.map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-orange-600">⚠ Areas for Improvement</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    {session.judgeFeedback.aiWeaknesses.map((weakness, i) => (
                      <li key={i}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {session.judgeFeedback.logicalFlaws.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Logical Flaws Detected</h3>
                  <div className="space-y-3">
                    {session.judgeFeedback.logicalFlaws.map((flaw, i) => (
                      <Card key={i} className="border-orange-200">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Badge variant={flaw.speaker === 'human' ? 'default' : 'secondary'}>
                              {flaw.speaker === 'human' ? 'You' : 'AI'}
                            </Badge>
                            <div className="flex-1 space-y-1">
                              <p className="font-medium text-sm">{flaw.flaw}</p>
                              <p className="text-sm text-muted-foreground">{flaw.explanation}</p>
                              <p className="text-xs text-muted-foreground">
                                In {PHASE_LABELS[flaw.phase as keyof typeof PHASE_LABELS]}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-2">Judge&apos;s Reasoning</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {session.judgeFeedback.reasoning}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
