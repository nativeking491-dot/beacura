import { ChatMessage } from "../types";

// --- Types ---

type IntentType =
    | "greeting"
    | "craving"
    | "craving_followup"
    | "mood_low"
    | "mood_high"
    | "anxiety"
    | "panic_attack"
    | "sleep"
    | "motivation"
    | "relapse"
    | "resilience"
    | "gratitude"
    | "farewell"
    | "halt_check"
    | "nutrition"
    | "hydration"
    | "exercise"
    | "withdrawal_timeline"
    | "paws"
    | "unknown";

interface ConversationState {
    currentFlow: "normal" | "craving_intervention" | "panic_intervention" | "halt_assessment" | "withdrawal_assessment";
    step: number;
    lastIntent: IntentType;
    contextData: any;
}

// In-memory state storage (simulated per user/session)
// In a real app with backend, this would be in the database. 
// For this local version, we'll use a simple module-level map keyed by session/user.
const userStates = new Map<string, ConversationState>();

// --- Knowledge Base & Response Patterns ---

interface ResponsePattern {
    intent: IntentType;
    patterns: RegExp[];
    responses: (string | ((name: string) => string))[];
    action?: "start_craving_flow" | "start_panic_flow" | "start_halt_flow" | "start_withdrawal_flow";
}

const KNOWLEDGE_BASE: ResponsePattern[] = [
    {
        intent: "nutrition",
        patterns: [/\b(food|eat|diet|nutrition|vitamin|supplement|sugar|hungry)\b/i],
        responses: [
            "Your brain is healing, and it needs fuel. Foods high in Omega-3s (like walnuts, fish) and antioxidants (berries, leafy greens) are great for checking repair.",
            "Sugar cravings are common in early recovery as your dopamine levels adjust. Try to stick to complex carbs and protein to keep your blood sugar stable.",
            "Pro-Tip: Dark chocolate (70%+) triggers a small dopamine release and is packed with antioxidants. A healthy little treat!",
            "Eating regular meals stabilizes your mood. Have you eaten something nutritious in the last 4 hours?"
        ]
    },
    {
        intent: "hydration",
        patterns: [/\b(water|drink|thirst|hydrate|dehydrat)\b/i],
        responses: [
            "Hydration is key for flushing out toxins. Aim for 3-4 liters a day. If you have a headache, start with a big glass of water.",
            "Dehydration can mimic anxiety and fatigue. Before you panic, drink a glass of water.",
            "Water helps your liver and kidneys do their heavy lifting during detox. Keep a bottle with you everywhere."
        ]
    },
    {
        intent: "exercise",
        patterns: [/\b(exercise|run|gym|walk|workout|activity|move)\b/i],
        responses: [
            "Movement generates natural endorphins—the body's own painkillers. Even a 10-minute walk can shift your mood significantly.",
            "You don't need a marathon. 'Green Exercise' (moving in nature) reduces cortisol levels faster than gym workouts.",
            "When you feel restless energy (akathisia), try to use it. Do pushups, dance, or walk until the energy settles."
        ]
    },
    {
        intent: "withdrawal_timeline",
        patterns: [/\b(timeline|how long|last|symptoms|withdraw|sick|nausea|shake)\b/i],
        responses: [
            "**Medical Disclaimer:** I am an AI, not a doctor. If symptoms are severe, please go to a hospital.\n\nGenerally, acute withdrawal peaks around day 3-5 for many substances and subsides by day 7-10. Post-acute symptoms can last months.",
            "It varies by substance, but the 'fog' usually starts to lift after the first two weeks. Hang in there; your body is doing incredible repair work right now.",
            "Physical symptoms are your body's way of recalibrating. Be gentle with it. Rest, hydrate, and don't expect to function at 100% yet."
        ]
    },
    {
        intent: "paws",
        patterns: [/\b(paws|post acute|fog|memory|concentrat|emotional|rollercoaster)\b/i],
        responses: [
            "PAWS (Post-Acute Withdrawal Syndrome) is real. It includes brain fog, irritability, and memory issues. It's not permanent—it's just your brain rewiring.",
            "If you feel like you're 'going crazy' months after quitting, it might be PAWS. It comes in waves. This wave will break too.",
            "Be patient with your memory and focus. Use notes, set reminders, and lower your expectations for productivity for a while."
        ]
    },
    {
        intent: "greeting",
        patterns: [/\b(hi|hello|hey|morning|afternoon|evening|greetings)\b/i, /^start$/i],
        responses: [
            (name) => `Hello ${name}! It's really good to see you. How are you feeling right now?`,
            "Hi there! I'm here and I'm listening. What's on your mind today?",
            (name) => `Welcome back, ${name}. I'm ready to walk this path with you today. How can I help?`
        ]
    },
    {
        intent: "craving",
        patterns: [/\b(crav|urge|want to use|need a drink|need a hit|trigger|fiending)\b/i],
        responses: [
            "I hear you, and I want you to know you're safe here. On a scale of 1-10, how intense is the urge right now?",
        ],
        action: "start_craving_flow"
    },
    {
        intent: "relapse",
        patterns: [/\b(relapse|slipped|messed up|used again|drank|high)\b/i],
        responses: [
            "Thank you for being honest. That takes courage. Please remember: a slip is an event, not a permanent failure. You haven't lost everything you learned.",
            "I'm here for you, no judgment. You are still worthy of recovery. Are you safe right now?",
            "Take a breath. Shame is not helpful right now—action is. What is the very next right thing you can do to get back to safety?"
        ]
    },
    {
        intent: "panic_attack",
        patterns: [/\b(panic|cant breathe|can't breathe|heart racing|dying|scared)\b/i],
        responses: [
            "I can hear that you're in distress. Let's slow things down together. Can you try to take one slow, deep breath with me?",
        ],
        action: "start_panic_flow"
    },
    {
        intent: "anxiety",
        patterns: [/\b(anxi|nervous|worry|worried|stress|overwhelm)\b/i],
        responses: [
            "It sounds like you're carrying a heavy load right now. Anxiety creates a lot of noise, doesn't it? What's one small thing bothering you the most?",
            "I'm listening. When we name our fears, they often lose a little power. Want to tell me more about what's making you anxious?",
            "You've handled difficult feelings before. You can handle this moment too. Let's focus on just the next 5 minutes. What do you need right now?"
        ]
    },
    {
        intent: "mood_low",
        patterns: [/\b(sad|depress|lone|hurt|pain|cry|awful|terrible|hopeless)\b/i],
        responses: [
            "I'm truly sorry you're hurting. It takes strength to just exist when things feel this heavy.",
            "You are not alone in this darkness, even if it feels that way for sure. I'm right here. 💙",
            "It's okay to not be okay today. Recovery isn't a straight line. Be gentle with yourself.",
            "Emotions are like weather—they storm, but eventually they pass. We just need to find shelter until this passes. How can I support you?"
        ]
    },
    {
        intent: "mood_high",
        patterns: [/\b(happy|good|great|awesome|proud|better|strong)\b/i],
        responses: [
            "That is wonderful to hear! ✨ Hold onto this feeling—this is what recovery makes possible.",
            (name) => `I'm so proud of you, ${name}! You're doing the work, and it shows.`,
            "Yes! 💪 Moments like these are fuel for the journey. What's the best part of your day so far?"
        ]
    },
    {
        intent: "sleep",
        patterns: [/\b(sleep|tired|awake|insomnia|exhaust|nightmare)\b/i],
        responses: [
            "Sleep struggles are so common in recovery as the brain heals. It's frustrating, but it gets better.",
            "If you can't sleep, try 'The 4-7-8 Breathing': Inhale for 4, hold for 7, exhale for 8. It signals your nervous system to rest.",
            "Rest is productive too. Even if you're just lying there, your body is healing. unexpected rest is better than stressful tossing.",
            "Have you tried a 'brain dump'? Write down everything worrying you so your mind knows it's safe to let go for the night."
        ]
    },
    {
        intent: "motivation",
        patterns: [/\b(motivat|give up|quit|stop|can't do this|hard)\b/i],
        responses: [
            "\"The only way out is through.\" You are forging a new path, and that is incredibly hard work. But you are capable.",
            "Look at how far you've come. Even your worst day in recovery is better than your best day in active addiction. Keep going.",
            "You don't have to stay clean for the rest of your life right now. You just have to stay clean for today. Can you do that?",
            "Your future self is begging you not to give up. You are building the life you deserve, brick by brick."
        ]
    },
    {
        intent: "halt_check",
        patterns: [/\b(halt|hungry|angry|tired)\b/i],
        responses: [
            "The HALT method is a lifesaver. Let's check in: Are you Hungry, Angry, Lonely, or Tired right now?",
        ],
        action: "start_halt_flow"
    }
];

// --- Intervention Flows (CBT/MI Techniques) ---

const handleCravingFlow = (input: string, state: ConversationState, name: string): { text: string, newState: ConversationState } => {
    const step = state.step;
    let text = "";

    // Minimal state machine for Urge Surfing / Distraction
    switch (step) {
        case 0: // Just started
            text = "Okay. Thank you for rating it. Now, I want you to try 'Urge Surfing' with me. \n\nClose your eyes for a second. Imagine this craving is like a wave in the ocean. It rises, peaks, and then crashes onto the shore. You don't have to stop the wave—you just have to ride it until it breaks. \n\nWhere do you feel this craving in your body right now? (Chest, stomach, hands?)";
            state.step = 1;
            break;
        case 1:
            text = "Good. effective observation. Now, don't fight it. Just notice it: 'I am having a thought about using.' It's just a thought. It has no power to make you move your muscles. \n\nLet's take 3 deep breaths together. In... 1, 2, 3. Out... 1, 2, 3. \n\nDid the intensity change at all?";
            state.step = 2;
            break;
        case 2:
            text = "You're doing great. Cravings usually peak within 15-20 minutes. You've already surfed through part of it! \n\nFor the next 5 minutes, let's distract your brain. Can you name 3 things you can see around you right now?";
            state.step = 3;
            break;
        case 3:
            text = `Excellent. You are grounded in reality, not the craving. \n\n${name}, look at what you just did—you faced a trigger and didn't use. That is massive strength. \n\nHow are you feeling now compared to when we started?`;
            state.step = 4;
            break;
        default:
            text = "I'm really proud of you for working through that. Whenever a wave comes, know that you have the surfboard now. I'm here anytime.";
            state.currentFlow = "normal";
            state.step = 0;
    }

    return { text, newState: state };
};

const handlePanicFlow = (input: string, state: ConversationState): { text: string, newState: ConversationState } => {
    const step = state.step;
    let text = "";

    switch (step) {
        case 0:
            text = "Okay, focus only on my words. \n\n5-4-3-2-1 Grounding. \n\nTell me 5 things you can SEE around you right now. Type them out.";
            state.step = 1;
            break;
        case 1:
            text = "Good. Now, tell me 4 things you can physically FEEL (your feet on the floor, the fabric of your shirt, the air on your skin).";
            state.step = 2;
            break;
        case 2:
            text = "You're doing safe. Now 3 things you can HEAR.";
            state.step = 3;
            break;
        default:
            text = "Take a deep breath. You are safe. This feeling is temporary and it is already passing. You did a great job grounding yourself.";
            state.currentFlow = "normal";
            state.step = 0;
    }

    return { text, newState: state };
};

// --- Main Logic ---

export const generateLocalResponse = async (
    prompt: string,
    userStreak: number = 0,
    userName: string = "Friend",
    mentorName?: string,
    mentorGender?: "male" | "female" | "neutral"
): Promise<string> => {
    // Simulate natural delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));

    const userId = "current_user"; // In a real scenario, pass unique ID
    let state = userStates.get(userId) || {
        currentFlow: "normal",
        step: 0,
        lastIntent: "greeting",
        contextData: {}
    };

    const lowerPrompt = prompt.toLowerCase();

    // Mentor Persona Prefixes
    let prefix = "";
    if (mentorName) {
        if (mentorGender === "male") {
            prefix = [
                "Man, I hear you. ",
                "Brother, ",
                "Listen, ",
                "From my experience, ",
                "Trust me on this, "
            ][Math.floor(Math.random() * 5)];
        } else if (mentorGender === "female") {
            prefix = [
                "I hear you, love. ",
                "Sweetheart, listen. ",
                "I understand completely. ",
                "It's okay to feel this way. ",
                "From one survivor to another, "
            ][Math.floor(Math.random() * 5)];
        } else {
            prefix = `${mentorName} here. `;
        }

        // 20% chance to just start directly without prefix to sound natural
        if (Math.random() > 0.8) prefix = "";
    }

    // 1. Handle Active Intervention Flows
    if (state.currentFlow === "craving_intervention") {
        const result = handleCravingFlow(prompt, state, userName);
        userStates.set(userId, result.newState);
        return prefix + result.text;
    }

    if (state.currentFlow === "panic_intervention") {
        const result = handlePanicFlow(prompt, state);
        userStates.set(userId, result.newState);
        return prefix + result.text;
    }

    // 2. Identify New Intent
    let matchedIntent: IntentType = "unknown";
    let matchedPattern: ResponsePattern | undefined;

    for (const entry of KNOWLEDGE_BASE) {
        if (entry.patterns.some(p => p.test(lowerPrompt))) {
            matchedIntent = entry.intent;
            matchedPattern = entry;
            break;
        }
    }

    // 3. Trigger New Flows if needed
    if (matchedPattern?.action) {
        if (matchedPattern.action === "start_craving_flow") {
            state.currentFlow = "craving_intervention";
            state.step = 0;
            userStates.set(userId, state);
            const resp = typeof matchedPattern.responses[0] === 'function'
                ? matchedPattern.responses[0](userName)
                : matchedPattern.responses[0] as string;
            return prefix + resp;
        }
        if (matchedPattern.action === "start_panic_flow") {
            state.currentFlow = "panic_intervention";
            state.step = 0;
            userStates.set(userId, state);
            const resp = typeof matchedPattern.responses[0] === 'function'
                ? matchedPattern.responses[0](userName)
                : matchedPattern.responses[0] as string;
            return prefix + resp;
        }
        if (matchedPattern.action === "start_withdrawal_flow") {
            // Simple one-response flow for now, but state is ready for multi-step
            // state.currentFlow = "withdrawal_assessment";
            // state.step = 0;
            // userStates.set(userId, state);
            const resp = typeof matchedPattern.responses[0] === 'function'
                ? matchedPattern.responses[0](userName)
                : matchedPattern.responses[0] as string;
            return prefix + resp;
        }
        if (matchedPattern.action === "start_halt_flow") {
            // Example placeholder if we had a halt flow
            const resp = typeof matchedPattern.responses[0] === 'function'
                ? matchedPattern.responses[0](userName)
                : matchedPattern.responses[0] as string;
            return prefix + resp;
        }
    }

    // 4. Standard Response Generation
    if (matchedPattern) {
        const responses = matchedPattern.responses;
        const response = responses[Math.floor(Math.random() * responses.length)];
        state.lastIntent = matchedIntent;
        userStates.set(userId, state);

        const finalResp = typeof response === 'function' ? response(userName) : response;
        return prefix + finalResp;
    }

    // 5. Fallback / Reflective Listening Logic (The "ELIZA" effect but for recovery)

    // Reflection logic
    if (lowerPrompt.includes("i feel")) {
        return prefix + `It sounds like you're feeling ${lowerPrompt.split("i feel")[1].trim()}. Can you tell me what triggered that feeling?`;
    }
    if (lowerPrompt.includes("i am")) {
        return prefix + `You say you are ${lowerPrompt.split("i am")[1].trim()}. How long have you felt like that?`;
    }
    if (lowerPrompt.includes("because")) {
        return prefix + "I see. Identifying the 'why' is a powerful step in recovery. Tell me more.";
    }

    // Context-aware fallback
    if (userStreak > 7 && Math.random() > 0.7) {
        return prefix + `You've held strong for ${userStreak} days. That proves you have resilience. How can we use that strength today?`;
    }

    const DEFAULT_RESPONSES = [
        "I'm listening. Please go on.",
        "Thank you for sharing that with me. What else is on your mind?",
        "Recovery is a journey of many small steps. I'm here for this one.",
        "That sounds important. Can you explain a bit more?",
        "I hear you. You are not alone in this."
    ];

    return prefix + DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
};
