'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface TopicSelectorProps {
  onTopicSelect: (topic: string) => void;
}

const SUGGESTED_TOPICS = [
  'Artificial intelligence will have a net positive impact on society',
  'Social media does more harm than good',
  'Universal basic income should be implemented globally',
  'Space exploration is worth the investment',
  'Remote work is better than office work',
];

export function TopicSelector({ onTopicSelect }: TopicSelectorProps) {
  const [customTopic, setCustomTopic] = useState('');

  const handleSubmit = () => {
    if (customTopic.trim()) {
      onTopicSelect(customTopic.trim());
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Douglas Debate Platform</h1>
        <p className="text-muted-foreground">
          Engage in structured debates with an AI opponent
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select a Debate Topic</CardTitle>
          <CardDescription>
            Choose a suggested topic or create your own
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Suggested Topics</h3>
            <div className="grid gap-2">
              {SUGGESTED_TOPICS.map((topic, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4 text-left"
                  onClick={() => onTopicSelect(topic)}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Custom Topic</h3>
            <Textarea
              placeholder="Enter your own debate topic..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={handleSubmit}
              disabled={!customTopic.trim()}
              className="w-full"
            >
              Start Debate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="font-bold text-primary">1.</span>
            <p className="text-sm">Select or create a debate topic</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-bold text-primary">2.</span>
            <p className="text-sm">Present your opening statement</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-bold text-primary">3.</span>
            <p className="text-sm">The AI responds with its opening statement</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-bold text-primary">4.</span>
            <p className="text-sm">Exchange rebuttals</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-bold text-primary">5.</span>
            <p className="text-sm">Conclude with closing arguments</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
