'use client';

import { DebateArgument, PHASE_LABELS } from '@/types/debate';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ArgumentCardProps {
  argument: DebateArgument;
}

export function ArgumentCard({ argument }: ArgumentCardProps) {
  const isHuman = argument.speaker === 'human';

  return (
    <Card className={cn(
      'transition-all',
      isHuman ? 'bg-primary/5 border-primary/20' : 'bg-secondary/5 border-secondary/20'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={isHuman ? 'default' : 'secondary'}>
              {isHuman ? 'You' : 'AI Opponent'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {PHASE_LABELS[argument.phase]}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {argument.timestamp.toLocaleTimeString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {argument.content}
        </p>
      </CardContent>
    </Card>
  );
}
