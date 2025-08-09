import React from 'react';

interface VoiceResponseProps {
  text: string;
  apiKey: string | null;
  isEnabled: boolean;
}

const VoiceResponse: React.FC<VoiceResponseProps> = ({ text, apiKey, isEnabled }) => {
  React.useEffect(() => {
    const speakText = async () => {
      if (!text || !isEnabled) return;

      // Try ElevenLabs first if API key is available
      if (apiKey) {
        try {
          const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': apiKey
            },
            body: JSON.stringify({
              text: text,
              model_id: 'eleven_monolingual_v1',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
              }
            })
          });

          if (response.ok) {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            await audio.play();
            return;
          }
        } catch (error) {
          console.error('ElevenLabs TTS error:', error);
        }
      }

      // Fallback to browser speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        // Try to find a good voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Chrome') ||
          voice.lang.startsWith('en')
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        speechSynthesis.speak(utterance);
      }
    };

    speakText();
  }, [text, apiKey, isEnabled]);

  return null; // This component doesn't render anything
};

export default VoiceResponse;