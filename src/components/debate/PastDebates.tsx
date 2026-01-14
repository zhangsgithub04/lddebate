'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { DebateSession } from '@/types/user';

interface PastDebatesProps {
  onBack: () => void;
  onViewSession: (session: DebateSession) => void;
}

export function PastDebates({ onBack, onViewSession }: PastDebatesProps) {
  const [sessions, setSessions] = useState<DebateSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/debate-sessions');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch sessions');
        }

        setSessions(data.sessions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load debates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Past Debates</h1>
          <p className="text-muted-foreground">Review your previous debate sessions</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && sessions.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">No past debates found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete a debate to see it here!
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && sessions.length > 0 && (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card
              key={session._id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => onViewSession(session)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{session.topic}</CardTitle>
                    <CardDescription>
                      {formatDate(session.createdAt.toString())}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={session.humanSide === 'affirmative' ? 'default' : 'secondary'}>
                      {session.humanSide === 'affirmative' ? 'Affirmative' : 'Negative'}
                    </Badge>
                    {session.completedAt && (
                      <Badge variant="outline">Completed</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Your Framework</p>
                    <p className="text-muted-foreground">{session.humanValue.value}</p>
                  </div>
                  <div>
                    <p className="font-medium">Arguments Exchanged</p>
                    <p className="text-muted-foreground">{session.arguments.length} total</p>
                  </div>
                </div>
                {session.judgeFeedback && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Your Score</p>
                        <p className="text-lg font-bold">{session.judgeFeedback.humanScore}/100</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Winner</p>
                        <Badge variant={
                          session.judgeFeedback.winner === 'human' ? 'default' :
                          session.judgeFeedback.winner === 'ai' ? 'secondary' :
                          'outline'
                        }>
                          {session.judgeFeedback.winner === 'human' ? 'You' :
                           session.judgeFeedback.winner === 'ai' ? 'AI' : 'Tie'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
