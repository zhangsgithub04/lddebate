'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TopicSelectorProps {
  onTopicSelect: (topic: string) => void;
}

interface DebateTopic {
  year: string;
  period: string;
  resolution: string;
}

export function TopicSelector({ onTopicSelect }: TopicSelectorProps) {
  const [customTopic, setCustomTopic] = useState('');
  const [topics, setTopics] = useState<DebateTopic[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const response = await fetch('/topiclist.csv');
        const text = await response.text();
        const lines = text.trim().split('\n');
        
        // Skip header row
        const parsedTopics = lines.slice(1).map(line => {
          const match = line.match(/^([^,]+),([^,]+),"(.+)"$/);
          if (match) {
            return {
              year: match[1].trim(),
              period: match[2].trim(),
              resolution: match[3].trim(),
            };
          }
          return null;
        }).filter((topic): topic is DebateTopic => topic !== null);
        
        setTopics(parsedTopics);
        setLoading(false);
      } catch (error) {
        console.error('Error loading topics:', error);
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  const handleSubmit = () => {
    if (customTopic.trim()) {
      onTopicSelect(customTopic.trim());
    }
  };

  // Get unique years sorted in descending order
  const years = ['all', ...Array.from(new Set(topics.map(t => t.year))).sort().reverse()];

  // Filter topics by selected year
  const filteredTopics = selectedYear === 'all' 
    ? topics 
    : topics.filter(t => t.year === selectedYear);

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Douglas Debate Platform</h1>
        <p className="text-muted-foreground">
          Engage in structured Lincoln-Douglas debates with an AI opponent
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Historical Topics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>NSDA Lincoln-Douglas Debate Topics</CardTitle>
            <CardDescription>
              Select a historical topic from past tournaments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Year Filter */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Filter by Year</h3>
              <div className="flex flex-wrap gap-2">
                {years.map((year) => (
                  <Button
                    key={year}
                    variant={selectedYear === year ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedYear(year)}
                  >
                    {year === 'all' ? 'All Years' : year}
                  </Button>
                ))}
              </div>
            </div>

            {/* Topics List */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                {loading ? 'Loading topics...' : `${filteredTopics.length} Topics Available`}
              </h3>
              <ScrollArea className="h-[500px] rounded-md border">
                <div className="p-4 space-y-2">
                  {filteredTopics.map((topic, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-auto py-4 px-4 text-left"
                      onClick={() => onTopicSelect(topic.resolution)}
                    >
                      <div className="space-y-2 w-full">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">{topic.year}</Badge>
                          <Badge variant="outline">{topic.period}</Badge>
                        </div>
                        <p className="text-sm leading-relaxed">{topic.resolution}</p>
                      </div>
                    </Button>
                  ))}
                  {filteredTopics.length === 0 && !loading && (
                    <p className="text-center text-muted-foreground py-8">
                      No topics found for the selected year.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Custom Topic & Instructions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Topic</CardTitle>
              <CardDescription>
                Create your own debate resolution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Resolved: [Your topic here]"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="min-h-[120px]"
              />
              <Button 
                onClick={handleSubmit}
                disabled={!customTopic.trim()}
                className="w-full"
              >
                Start Custom Debate
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <span className="font-bold text-primary">1.</span>
                <p className="text-sm">Select a topic from the list or create your own</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-primary">2.</span>
                <p className="text-sm">Choose your side (Affirmative or Negative)</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-primary">3.</span>
                <p className="text-sm">Establish your Value and Criterion framework</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-primary">4.</span>
                <p className="text-sm">Present opening statements and rebuttals</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-primary">5.</span>
                <p className="text-sm">Conclude with closing arguments</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
