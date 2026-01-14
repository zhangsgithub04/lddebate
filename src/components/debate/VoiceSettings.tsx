'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';

interface VoiceSettingsProps {
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceSelect: (voice: SpeechSynthesisVoice) => void;
}

interface VoiceListProps {
  title: string;
  voiceList: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceSelect: (voice: SpeechSynthesisVoice) => void;
}

function VoiceList({ title, voiceList, selectedVoice, onVoiceSelect }: VoiceListProps) {
  if (voiceList.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="space-y-1">
        {voiceList.map((voice, index) => (
          <Button
            key={`${voice.name}-${index}`}
            variant={selectedVoice?.name === voice.name ? 'default' : 'outline'}
            size="sm"
            className="w-full justify-start text-left h-auto py-2"
            onClick={() => onVoiceSelect(voice)}
          >
            <div className="flex flex-col items-start w-full">
              <div className="flex items-center gap-2 w-full">
                <span className="text-sm">{voice.name}</span>
                {voice.localService && (
                  <Badge variant="secondary" className="text-xs">Local</Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{voice.lang}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

export function VoiceSettings({ voices, selectedVoice, onVoiceSelect }: VoiceSettingsProps) {
  // Group voices by quality
  const premiumVoices = voices.filter(v => 
    v.lang.startsWith('en') && (
      v.name.includes('Premium') || 
      v.name.includes('Natural') || 
      v.name.includes('Enhanced') ||
      v.name.includes('Neural')
    )
  );

  const googleVoices = voices.filter(v => 
    v.lang.startsWith('en') && v.name.includes('Google') && !premiumVoices.includes(v)
  );

  const otherVoices = voices.filter(v => 
    v.lang.startsWith('en') && !premiumVoices.includes(v) && !googleVoices.includes(v)
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Voice Settings</DialogTitle>
          <DialogDescription>
            Select a voice for AI responses. Premium and Natural voices sound more human-like.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Voice</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedVoice ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedVoice.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedVoice.lang}</p>
                  </div>
                  {selectedVoice.localService && (
                    <Badge variant="secondary">Local</Badge>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No voice selected</p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <VoiceList 
              title="🌟 Premium Voices (Recommended)" 
              voiceList={premiumVoices}
              selectedVoice={selectedVoice}
              onVoiceSelect={onVoiceSelect}
            />
            <VoiceList 
              title="Google Voices" 
              voiceList={googleVoices}
              selectedVoice={selectedVoice}
              onVoiceSelect={onVoiceSelect}
            />
            <VoiceList 
              title="Other English Voices" 
              voiceList={otherVoices}
              selectedVoice={selectedVoice}
              onVoiceSelect={onVoiceSelect}
            />
          </div>

          {voices.filter(v => v.lang.startsWith('en')).length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  No English voices available. Voice synthesis may not be supported in your browser.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
