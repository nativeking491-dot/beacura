// services/voiceCommandEngine.ts
// Handles bleeding-edge Web Speech API for Autonomous Hands-Free control

export type VoiceCommandIntent = 'navigate' | 'sos' | 'journal' | 'chat' | 'unknown';

interface VoiceCommandResult {
  intent: VoiceCommandIntent;
  target?: string;
  rawText: string;
}

export class VoiceCommandEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private onCommandCallback: ((result: VoiceCommandResult) => void) | null = null;
  private onListenStateChange: ((isListening: boolean) => void) | null = null;

  constructor() {
    this.init();
  }

  private init() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onListenStateChange) this.onListenStateChange(true);
      console.log("Voice Command System Active.");
    };

    this.recognition.onend = () => {
      // Auto-restart if we didn't explicitly turn it off
      if (this.isListening) {
        try {
            this.recognition.start();
        } catch (e) {
            console.error("Failed to restart speech recognition", e);
        }
      } else {
         if (this.onListenStateChange) this.onListenStateChange(false);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error: ", event.error);
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
          this.isListening = false;
          if (this.onListenStateChange) this.onListenStateChange(false);
      }
    };

    this.recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase();
      
      this.processTranscript(transcript);
    };
  }

  private processTranscript(text: string) {
    if (!this.onCommandCallback) return;

    // Hotword activation detection
    const hasHotword = text.includes('aira') || text.includes('ira') || text.includes('kai') || text.includes('computer');
    // We can enforce hotword if we want absolute strictness, but for now we look for intent.
    
    let result: VoiceCommandResult = { intent: 'unknown', rawText: text };

    if (text.includes('open') || text.includes('go to') || text.includes('navigate') || text.includes('take me to') || text.includes('show me')) {
        result.intent = 'navigate';
        if (text.includes('journal')) result.target = '/journal';
        else if (text.includes('dashboard') || text.includes('home')) result.target = '/dashboard';
        else if (text.includes('health') || text.includes('diet')) result.target = '/health';
        else if (text.includes('exercise') || text.includes('workout')) result.target = '/exercise';
        else if (text.includes('counseling') || text.includes('mentor')) result.target = '/counseling';
        else if (text.includes('profile')) result.target = '/profile';
        else if (text.includes('body map')) result.target = '/body-map';
        else result.intent = 'unknown'; // couldn't parse target
    } 
    else if (text.includes('help') || text.includes('sos') || text.includes('emergency') || text.includes('craving') || text.includes('relapse')) {
        result.intent = 'sos';
    }
    else if (text.includes('start chat') || text.includes('talk to you') || text.includes('chat bot')) {
        result.intent = 'chat';
    }

    if (result.intent !== 'unknown' || hasHotword) {
      this.onCommandCallback(result);
    }
  }

  public setCallback(cb: (result: VoiceCommandResult) => void) {
      this.onCommandCallback = cb;
  }

  public setListeningStateCallback(cb: (isListening: boolean) => void) {
      this.onListenStateChange = cb;
  }

  public start() {
      if (!this.recognition) return;
      this.isListening = true;
      try {
          this.recognition.start();
      } catch (e) {
          // already started
      }
  }

  public stop() {
      if (!this.recognition) return;
      this.isListening = false;
      this.recognition.stop();
  }

  public toggle() {
      if (this.isListening) {
          this.stop();
      } else {
          this.start();
      }
  }
  
  public isActive() {
      return this.isListening;
  }
}

// Singleton export
export const voiceCommandEngine = new VoiceCommandEngine();
