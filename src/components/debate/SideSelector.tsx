'use client';

import { DebateSide } from '@/types/debate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SideSelectorProps {
  topic: string;
  onSideSelect: (side: DebateSide) => void;
}

export function SideSelector({ topic, onSideSelect }: SideSelectorProps) {
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Select Your Side</h1>
        <p className="text-muted-foreground">
          Choose which side of the debate you want to defend
        </p>
        <Badge variant="secondary" className="text-sm">
          {topic}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => onSideSelect('affirmative')}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Affirmative
              <Badge variant="default">Goes First</Badge>
            </CardTitle>
            <CardDescription>
              Support the resolution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">As the Affirmative side, you will:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Present your value and criterion first</li>
              <li>Deliver the opening statement first</li>
              <li>Argue in favor of the resolution</li>
              <li>Prove that the resolution should be upheld</li>
            </ul>
            <Button className="w-full mt-4" onClick={() => onSideSelect('affirmative')}>
              Select Affirmative
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => onSideSelect('negative')}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Negative
              <Badge variant="secondary">Responds Second</Badge>
            </CardTitle>
            <CardDescription>
              Oppose the resolution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">As the Negative side, you will:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Respond to the Affirmative&apos;s framework</li>
              <li>Choose to accept or clash with their value/criterion</li>
              <li>Argue against the resolution</li>
              <li>Prove that the resolution should be rejected</li>
            </ul>
            <Button className="w-full mt-4" variant="outline" onClick={() => onSideSelect('negative')}>
              Select Negative
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lincoln-Douglas Debate Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Affirmative</strong> defends the resolution and has the burden of proof.
            They present their value framework first and make the opening statement.
          </p>
          <p>
            <strong>Negative</strong> opposes the resolution and can either accept the 
            Affirmative&apos;s framework or propose a competing one. This strategic choice 
            can significantly impact the debate.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
