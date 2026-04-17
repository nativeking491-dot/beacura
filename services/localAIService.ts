// Simple mock local AI service since we don't have a real LLM here
// In a real app this would call an API or use a local model via WebLLM

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export async function generateLocalResponse(messages: Message[]): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const userMessage = messages.find(m => m.role === 'user')?.content.toLowerCase() || '';

    // Simple keyword-based reflections
    if (userMessage.includes('sad') || userMessage.includes('hard') || userMessage.includes('difficult')) {
        return "That sounds like a heavy weight to carry. What's one small thing you can do to be gentle with yourself right now?";
    }
    
    if (userMessage.includes('happy') || userMessage.includes('proud') || userMessage.includes('win')) {
        return "It's wonderful that you're recognizing those positive moments. How does it feel in your body when you hold onto that pride?";
    }
    
    if (userMessage.includes('angry') || userMessage.includes('frustrated') || userMessage.includes('mad')) {
        return "Your frustration is completely valid. If that anger had a shape or color, what would it look like?";
    }
    
    if (userMessage.includes('anxious') || userMessage.includes('worried') || userMessage.includes('scared')) {
        return "Anxiety can be so exhausting. Have you taken a slow, deep breath today?";
    }
    
    if (userMessage.includes('grateful') || userMessage.includes('thankful')) {
        return "Gratitude is a powerful practice. Thank you for sharing that light today.";
    }

    // Default fallback reflections
    const fallbacks = [
        "Thank you for sharing that. What's one thing you need right now that you can give to yourself?",
        "I hear you. If you could wrap those feelings in a comforting blanket, what color would it be?",
        "That's really insightful. How does writing this out change how you feel about it?",
        "You're doing the hard work of showing up for yourself. What's your next gentle step?",
        "Reading this, I'm reminded of your resilience. Where do you feel that resilience in your body?"
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
