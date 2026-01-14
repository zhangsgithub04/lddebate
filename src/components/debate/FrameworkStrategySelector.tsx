'use client';

import { useState } from 'react';
import { FrameworkStrategy, ValueCriterion } from '@/types/debate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Swords } from 'lucide-react';

interface FrameworkStrategySelectorProps {
  topic: string;
  humanValue: ValueCriterion;
  onStrategySelect: (strategy: FrameworkStrategy) => void;
  isLoading?: boolean;
}

export function FrameworkStrategySelector({ 
  topic, 
  humanValue, 
  onStrategySelect,
  isLoading 
}: FrameworkStrategySelectorProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<FrameworkStrategy | null>(null);

  const handleSelect = (strategy: FrameworkStrategy) => {
    setSelectedStrategy(strategy);
    onStrategySelect(strategy);
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Framework Strategy</h1>
        <p className="text-muted-foreground">
          How should the AI respond to your framework?
        </p>
        <Badge variant="secondary" className="text-sm">
          {topic}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Framework</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Value:</span>
              <p className="text-lg font-semibold">{humanValue.value}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Criterion:</span>
              <p className="text-base">{humanValue.criterion}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${
            selectedStrategy === 'accept' ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => handleSelect('accept')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Accept Framework
            </CardTitle>
            <CardDescription>
              AI accepts your value and criterion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              The AI will adopt your framework and argue that your side does not 
              best achieve the value through the criterion you&apos;ve established.
            </p>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Strategic Considerations:</p>
              <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                <li>Focuses debate on arguments and impacts</li>
                <li>AI must prove they better achieve YOUR value</li>
                <li>Saves time by avoiding framework clash</li>
                <li>Tests your ability to defend your position</li>
              </ul>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={() => handleSelect('accept')}
              disabled={isLoading}
            >
              {isLoading && selectedStrategy === 'accept' ? 'Processing...' : 'Accept Framework'}
            </Button>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${
            selectedStrategy === 'clash' ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => handleSelect('clash')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-orange-500" />
              Clash Framework
            </CardTitle>
            <CardDescription>
              AI proposes competing value and criterion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              The AI will present its own framework with a different value and 
              criterion, arguing that its framework is superior or more relevant.
            </p>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Strategic Considerations:</p>
              <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                <li>Creates framework debate (more complex)</li>
                <li>AI argues under its own value system</li>
                <li>Requires defending your framework choice</li>
                <li>More challenging and realistic debate</li>
              </ul>
            </div>
            <Button 
              className="w-full mt-4" 
              variant="outline"
              onClick={() => handleSelect('clash')}
              disabled={isLoading}
            >
              {isLoading && selectedStrategy === 'clash' ? 'Generating AI Framework...' : 'Clash Framework'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Framework Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            In Lincoln-Douglas debate, the <strong>framework</strong> (value and criterion) 
            determines how we evaluate which side wins. The Negative side has two strategic options:
          </p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Accept:</p>
                <p className="text-muted-foreground">
                  &quot;I agree with your value of {humanValue.value}, and I&apos;ll prove my side
                  better achieves it through your criterion.&quot;
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Swords className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Clash:</p>
                <p className="text-muted-foreground">
                  &quot;I propose a different value and criterion that better evaluates this
                  resolution, and under my framework, my side wins.&quot;
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
