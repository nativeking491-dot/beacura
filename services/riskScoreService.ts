// services/riskScoreService.ts
// Calculates a 0–100 relapse risk score from logged data
// 0–30 = Low Risk (green), 31–60 = Moderate (amber), 61–100 = High Risk (rose)

import { supabase } from './supabaseClient';

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface RiskScore {
    score: number;
    level: RiskLevel;
    label: string;
    color: string;
    factors: string[];
}

function getRiskLabel(score: number): { level: RiskLevel; label: string; color: string } {
    if (score <= 30) return { level: 'low', label: 'Resilient', color: 'text-emerald-500' };
    if (score <= 60) return { level: 'moderate', label: 'Stay Aware', color: 'text-amber-500' };
    return { level: 'high', label: 'Reach Out Now', color: 'text-rose-500' };
}

export async function computeRiskScore(userId: string): Promise<RiskScore> {
    const factors: string[] = [];
    let score = 0;

    try {
        // Fetch last 3 mood logs
        const { data: moodLogs } = await supabase
            .from('mood_logs')
            .select('mood_score, sleep_quality, energy_level, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(3);

        // Fetch today's craving log (if any)
        const today = new Date().toISOString().split('T')[0];
        const { data: cravingLogs } = await supabase
            .from('craving_logs')
            .select('severity, created_at')
            .eq('user_id', userId)
            .gte('created_at', `${today}T00:00:00`)
            .order('severity', { ascending: false })
            .limit(1);

        // --- Mood Factor (0–20 points) ---
        if (moodLogs && moodLogs.length > 0) {
            const avgMood = moodLogs.reduce((s, l) => s + l.mood_score, 0) / moodLogs.length;
            const moodFactor = Math.round((10 - avgMood) * 2);
            score += moodFactor;
            if (avgMood <= 4) factors.push('Low mood detected recently');
            else if (avgMood <= 6) factors.push('Mood has been moderate');
        } else {
            // No recent logs = unknown state, add moderate penalty
            score += 10;
            factors.push('No recent mood check-ins');
        }

        // --- Sleep Factor (0–15 points) ---
        if (moodLogs && moodLogs.length > 0) {
            const avgSleep = moodLogs.reduce((s, l) => s + l.sleep_quality, 0) / moodLogs.length;
            const sleepFactor = Math.round((10 - avgSleep) * 1.5);
            score += sleepFactor;
            if (avgSleep <= 4) factors.push('Poor sleep quality observed');
        }

        // --- Craving Factor (0–25 points) ---
        if (cravingLogs && cravingLogs.length > 0) {
            const severity = cravingLogs[0].severity;
            const cravingFactor = Math.round(severity * 2.5);
            score += cravingFactor;
            factors.push(`Craving logged today (severity ${severity}/10)`);
        }

        // Clamp to 0–100
        score = Math.max(0, Math.min(100, score));

        // Save to DB
        await supabase.from('daily_risk_scores').upsert({
            user_id: userId,
            score,
            risk_level: getRiskLabel(score).level,
            computed_at: today,
        }, { onConflict: 'user_id,computed_at' });

    } catch (err) {
        console.error('Risk score computation error:', err);
    }

    const meta = getRiskLabel(score);
    return { score, ...meta, factors };
}
