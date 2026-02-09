// Crisis detection and response service
// Identifies and handles crisis situations for user safety

export const CRISIS_KEYWORDS = [
  'kill myself',
  'suicide',
  'overdose',
  'end it all',
  'cant take it',
  'dying',
  'no point',
  'give up',
  'lost hope',
  'last option',
  'cut myself',
  'harm myself',
  'want to die',
  'killing myself',
  'jump off',
  'hang myself',
  'slit',
  'poison',
  'drown myself',
  'everything is hopeless',
  'nothing matters',
  'shouldnt exist',
  'dont want to live',
  'life isnt worth',
  'better off dead',
  'relapsed'
];

export const SELF_HARM_KEYWORDS = [
  'cut myself',
  'hurt myself',
  'harm myself',
  'wound',
  'bleed',
  'burn',
  'punch wall'
];

export const OVERDOSE_KEYWORDS = [
  'overdose',
  'ods',
  'too much',
  'toxic',
  'poisoned',
  'hospital',
  'emergency'
];

interface CrisisSeverity {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  keywords: string[];
}

export const detectCrisisLanguage = (message: string): CrisisSeverity | null => {
  const lowerMessage = message.toLowerCase().trim();
  
  // Check for critical keywords first
  const foundCriticalKeywords = OVERDOSE_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword)
  );
  
  if (foundCriticalKeywords.length > 0) {
    return {
      level: 'critical',
      score: 100,
      keywords: foundCriticalKeywords
    };
  }

  // Check for self-harm keywords
  const foundHarmKeywords = SELF_HARM_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword)
  );
  
  if (foundHarmKeywords.length >= 2) {
    return {
      level: 'critical',
      score: 95,
      keywords: foundHarmKeywords
    };
  }

  if (foundHarmKeywords.length === 1) {
    return {
      level: 'high',
      score: 80,
      keywords: foundHarmKeywords
    };
  }

  // Check for suicide keywords
  const foundSuicideKeywords = CRISIS_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword)
  );
  
  if (foundSuicideKeywords.length >= 3) {
    return {
      level: 'critical',
      score: 90,
      keywords: foundSuicideKeywords
    };
  }

  if (foundSuicideKeywords.length === 2) {
    return {
      level: 'high',
      score: 75,
      keywords: foundSuicideKeywords
    };
  }

  if (foundSuicideKeywords.length === 1) {
    return {
      level: 'medium',
      score: 50,
      keywords: foundSuicideKeywords
    };
  }

  return null;
};

export interface CrisisResponse {
  title: string;
  message: string;
  hotlines: Array<{
    name: string;
    number?: string;
    message?: string;
    available: string;
  }>;
  actions: Array<{
    label: string;
    action: string;
  }>;
}

export const getCrisisResponse = (): CrisisResponse => {
  return {
    title: "💙 We're Here For You",
    message: "Your safety matters to us. Please reach out to trained professionals right now.",
    hotlines: [
      {
        name: "National Suicide Prevention Lifeline",
        number: "988",
        available: "24/7 Free & Confidential"
      },
      {
        name: "Crisis Text Line",
        message: "Text HOME to 741741",
        available: "24/7 Free"
      },
      {
        name: "SAMHSA National Helpline",
        number: "1-800-662-4357",
        available: "24/7 Free & Confidential"
      },
      {
        name: "National Poison Control",
        number: "1-800-222-1222",
        available: "24/7 Free"
      }
    ],
    actions: [
      { label: "Call 911", action: "emergency" },
      { label: "Call 988", action: "crisis_call" },
      { label: "Text 741741", action: "crisis_text" },
      { label: "I'm Safe Now", action: "dismiss" }
    ]
  };
};

export const logCrisisEvent = async (
  supabase: any,
  userId: string | undefined,
  message: string,
  severity: CrisisSeverity
) => {
  if (!userId) return;
  
  try {
    const { error } = await supabase.from('crisis_logs').insert({
      user_id: userId,
      message,
      severity: severity.level,
      keywords_detected: severity.keywords
    });

    if (error) console.error('Error logging crisis event:', error);
    
    // Always notify admins if critical
    if (severity.level === 'critical') {
      notifyAdminsOfCrisis(supabase, userId, message, severity);
    }
  } catch (error) {
    console.error('Failed to log crisis event:', error);
  }
};

const notifyAdminsOfCrisis = async (
  supabase: any,
  userId: string,
  message: string,
  severity: CrisisSeverity
) => {
  try {
    // In production, this would send emails or push notifications to admins
    // For now, log to admin panel
    const { error } = await supabase.from('crisis_logs').update({
      admin_notified: true,
      admin_notified_at: new Date().toISOString()
    }).eq('user_id', userId);

    if (error) console.error('Error notifying admins:', error);
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
};
