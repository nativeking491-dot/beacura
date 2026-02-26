// Basic client-side keyword-based sentiment analysis
// A full implementation would use a proper NLP library or an API endpoint

const positiveWords = new Set([
    'good', 'great', 'amazing', 'happy', 'joy', 'excited', 'love', 'fantastic',
    'wonderful', 'proud', 'accomplished', 'strong', 'better', 'improving',
    'growth', 'peaceful', 'calm', 'hopeful', 'blessed', 'thankful', 'grateful',
    'progress', 'sober', 'clean', 'achievement'
]);

const negativeWords = new Set([
    'bad', 'terrible', 'awful', 'sad', 'angry', 'depressed', 'anxious', 'fear',
    'scared', 'worried', 'stressed', 'overwhelmed', 'craving', 'relapse', 'urge',
    'weak', 'struggle', 'struggling', 'pain', 'hurt', 'lost', 'hopeless',
    'frustrated', 'exhausted', 'tired', 'mad'
]);

export function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    if (!text || text.trim().length === 0) return 'neutral';

    const words = text.toLowerCase().match(/\b\w+\b/g) || [];

    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
        if (positiveWords.has(word)) positiveCount++;
        if (negativeWords.has(word)) negativeCount++;
    });

    // Calculate sentiment score
    const totalSentimentWords = positiveCount + negativeCount;

    // Not enough sentiment data
    if (totalSentimentWords === 0) return 'neutral';

    const ratio = positiveCount / totalSentimentWords;

    if (ratio > 0.6) return 'positive';
    if (ratio < 0.4) return 'negative';
    return 'neutral';
}
