'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceSettings } from './VoiceSettings';

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  transcript: string;
  disabled?: boolean;
  speechEnabled: boolean;
  onToggleSpeech: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceSelect: (voice: SpeechSynthesisVoice) => void;
}

export function VoiceControls({
  isListening,
  isSpeaking,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  transcript,
  disabled,
  speechEnabled,
  onToggleSpeech,
  voices,
  selectedVoice,
  onVoiceSelect,
}: VoiceControlsProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={isListening ? 'destructive' : 'default'}
          size="lg"
          onClick={isListening ? onStopListening : onStartListening}
          disabled={disabled || isSpeaking}
          className={cn(
            'flex-1',
            isListening && 'animate-pulse'
          )}
        >
          {isListening ? (
            <>
              <MicOff className="mr-2 h-5 w-5" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="mr-2 h-5 w-5" />
              Start Recording
            </>
          )}
        </Button>

        <Button
          type="button"
          variant={speechEnabled ? 'default' : 'outline'}
          size="lg"
          onClick={onToggleSpeech}
          title={speechEnabled ? 'Disable AI voice' : 'Enable AI voice'}
        >
          {speechEnabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </Button>

        {voices.length > 0 && (
          <VoiceSettings
            voices={voices}
            selectedVoice={selectedVoice}
            onVoiceSelect={onVoiceSelect}
          />
        )}
      </div>

      {isSpeaking && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onStopSpeaking}
          className="w-full"
        >
          <VolumeX className="mr-2 h-4 w-4" />
          Stop AI Speaking
        </Button>
      )}

      {isListening && transcript && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-1">Live Transcript:</p>
            <p className="text-sm">{transcript}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
