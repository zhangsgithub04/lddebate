'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

interface DebateTimerProps {
  timeLimit: number; // in seconds
  onTimeUp?: () => void;
  autoStart?: boolean;
  showControls?: boolean;
}

export function DebateTimer({ 
  timeLimit, 
  onTimeUp, 
  autoStart = false,
  showControls = true 
}: DebateTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [hasStarted, setHasStarted] = useState(autoStart);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUp]);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setHasStarted(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setTimeRemaining(timeLimit);
    setIsRunning(false);
    setHasStarted(false);
  }, [timeLimit]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const percentageRemaining = (timeRemaining / timeLimit) * 100;
  const isLowTime = percentageRemaining < 25;
  const isMediumTime = percentageRemaining < 50 && !isLowTime;

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${isLowTime ? 'text-red-500' : isMediumTime ? 'text-yellow-500' : 'text-green-500'}`} />
            <span className="text-sm font-medium text-muted-foreground">Time Remaining</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant={isLowTime ? 'destructive' : isMediumTime ? 'default' : 'secondary'}
              className="text-2xl font-mono px-4 py-2"
            >
              {formatTime(timeRemaining)}
            </Badge>
            
            {showControls && (
              <div className="flex gap-1">
                {!isRunning && !hasStarted && (
                  <Button size="sm" onClick={handleStart} variant="default">
                    <Play className="w-4 h-4" />
                  </Button>
                )}
                {isRunning && (
                  <Button size="sm" onClick={handlePause} variant="outline">
                    <Pause className="w-4 h-4" />
                  </Button>
                )}
                {!isRunning && hasStarted && timeRemaining > 0 && (
                  <Button size="sm" onClick={handleStart} variant="outline">
                    <Play className="w-4 h-4" />
                  </Button>
                )}
                {hasStarted && (
                  <Button size="sm" onClick={handleReset} variant="ghost">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${
              isLowTime ? 'bg-red-500' : isMediumTime ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${percentageRemaining}%` }}
          />
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {timeRemaining === 0 ? 'Time is up!' : `${formatTime(timeLimit)} total`}
        </div>
      </CardContent>
    </Card>
  );
}
