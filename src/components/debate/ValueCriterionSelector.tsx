'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface ValueCriterionSelectorProps {
  topic: string;
  onSubmit: (value: string, criterion: string) => void;
  onBack: () => void;
}

const COMMON_VALUES = [
  'Justice',
  'Morality',
  'Freedom',
  'Equality',
  'Human Dignity',
  'Social Welfare',
  'Individual Rights',
  'Public Safety',
];

const CRITERION_EXAMPLES = [
  'Maximizing overall happiness',
  'Protecting individual autonomy',
  'Upholding human rights',
  'Promoting social stability',
  'Ensuring equal opportunity',
  'Preserving natural rights',
];

export function ValueCriterionSelector({ topic, onSubmit, onBack }: ValueCriterionSelectorProps) {
  const [value, setValue] = useState('');
  const [criterion, setCriterion] = useState('');

  const handleSubmit = () => {
    if (value.trim() && criterion.trim()) {
      onSubmit(value.trim(), criterion.trim());
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Define Your Framework</h1>
          <p className="text-muted-foreground">{topic}</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Value & Criterion</CardTitle>
          <CardDescription>
            Establish the philosophical foundation for your arguments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Value Section */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium mb-2">Value</h3>
              <p className="text-xs text-muted-foreground mb-3">
                The core principle or ideal that your case will uphold (e.g., Justice, Morality, Freedom)
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_VALUES.map((v) => (
                <Badge
                  key={v}
                  variant={value === v ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => setValue(v)}
                >
                  {v}
                </Badge>
              ))}
            </div>

            <Textarea
              placeholder="Enter your value or select from common values above..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Criterion Section */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium mb-2">Value Criterion (Standard)</h3>
              <p className="text-xs text-muted-foreground mb-3">
                The measuring stick for achieving your value - how we determine if the value is being upheld
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium">Examples:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {CRITERION_EXAMPLES.map((ex, idx) => (
                  <li key={idx} className="cursor-pointer hover:text-foreground" onClick={() => setCriterion(ex)}>
                    • {ex}
                  </li>
                ))}
              </ul>
            </div>

            <Textarea
              placeholder="Enter your value criterion (how to measure/achieve your value)..."
              value={criterion}
              onChange={(e) => setCriterion(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!value.trim() || !criterion.trim()}
            className="w-full"
            size="lg"
          >
            Continue to Debate
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What are Values and Criteria?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">Value:</p>
            <p className="text-muted-foreground">
              A core principle or ideal that both sides agree is important. It frames the debate around a shared philosophical goal.
            </p>
          </div>
          <div>
            <p className="font-medium">Value Criterion:</p>
            <p className="text-muted-foreground">
              The standard by which we measure whether the value is being achieved. It provides a concrete way to evaluate arguments.
            </p>
          </div>
          <div>
            <p className="font-medium">Example:</p>
            <p className="text-muted-foreground">
              <strong>Value:</strong> Justice<br />
              <strong>Criterion:</strong> Protecting individual rights ensures that all people receive fair treatment, which is the foundation of a just society.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
