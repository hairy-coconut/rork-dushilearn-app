import { supabase } from '../utils/supabase';

export interface Skill {
    id: string;
    title: string;
    description: string;
    strength: number; // 0-100
    lastPracticed: Date;
    nextPracticeDue: Date;
    xpReward: number;
    category: string;
    order: number;
}

export interface PracticeSession {
    id: string;
    skillId: string;
    score: number;
    timeSpent: number;
    mistakes: number;
    completedAt: Date;
}

const STRENGTH_DECAY_RATE = 5; // points per day
const MIN_STRENGTH = 0;
const MAX_STRENGTH = 100;
const PRACTICE_INTERVAL = 24; // hours

export async function getSkillStrength(userId: string, skillId: string): Promise<Skill> {
    const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_id', skillId)
        .single();

    if (error || !data) {
        // Create new skill tracking if none exists
        const newSkill: Skill = {
            id: skillId,
            title: '', // Will be populated from skills table
            description: '',
            strength: MAX_STRENGTH,
            lastPracticed: new Date(),
            nextPracticeDue: new Date(Date.now() + PRACTICE_INTERVAL * 60 * 60 * 1000),
            xpReward: 10,
            category: '',
            order: 0,
        };

        await supabase
            .from('user_skills')
            .insert({
                user_id: userId,
                skill_id: skillId,
                strength: MAX_STRENGTH,
                last_practiced: newSkill.lastPracticed.toISOString(),
                next_practice_due: newSkill.nextPracticeDue.toISOString(),
            });

        return newSkill;
    }

    // Calculate current strength based on time passed
    const lastPracticed = new Date(data.last_practiced);
    const now = new Date();
    const daysPassed = (now.getTime() - lastPracticed.getTime()) / (1000 * 60 * 60 * 24);
    const strengthDecay = Math.floor(daysPassed * STRENGTH_DECAY_RATE);
    
    const currentStrength = Math.max(
        MIN_STRENGTH,
        data.strength - strengthDecay
    );

    // Update strength if it has decayed
    if (currentStrength < data.strength) {
        await supabase
            .from('user_skills')
            .update({
                strength: currentStrength,
            })
            .eq('user_id', userId)
            .eq('skill_id', skillId);
    }

    return {
        id: skillId,
        title: data.title || '',
        description: data.description || '',
        strength: currentStrength,
        lastPracticed: lastPracticed,
        nextPracticeDue: new Date(data.next_practice_due),
        xpReward: data.xp_reward || 10,
        category: data.category || '',
        order: data.order || 0,
    };
}

export async function completePracticeSession(
    userId: string,
    skillId: string,
    score: number,
    timeSpent: number,
    mistakes: number
): Promise<PracticeSession> {
    const skill = await getSkillStrength(userId, skillId);
    
    // Calculate strength increase based on performance
    const baseIncrease = 20;
    const timeBonus = Math.max(0, 1 - (timeSpent / 300)); // Up to 10 points for speed
    const mistakePenalty = mistakes * 2; // 2 points per mistake
    const strengthIncrease = Math.min(
        MAX_STRENGTH - skill.strength,
        baseIncrease + (timeBonus * 10) - mistakePenalty
    );

    // Update skill strength
    const { error: updateError } = await supabase
        .from('user_skills')
        .update({
            strength: skill.strength + strengthIncrease,
            last_practiced: new Date().toISOString(),
            next_practice_due: new Date(Date.now() + PRACTICE_INTERVAL * 60 * 60 * 1000).toISOString(),
        })
        .eq('user_id', userId)
        .eq('skill_id', skillId);

    if (updateError) {
        throw new Error('Failed to update skill strength');
    }

    // Record practice session
    const { data: session, error: sessionError } = await supabase
        .from('practice_sessions')
        .insert({
            user_id: userId,
            skill_id: skillId,
            score,
            time_spent: timeSpent,
            mistakes,
            completed_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (sessionError) {
        throw new Error('Failed to record practice session');
    }

    return {
        id: session.id,
        skillId: session.skill_id,
        score: session.score,
        timeSpent: session.time_spent,
        mistakes: session.mistakes,
        completedAt: new Date(session.completed_at),
    };
}

export async function getSkillsNeedingPractice(userId: string): Promise<Skill[]> {
    const now = new Date();
    const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId)
        .lte('next_practice_due', now.toISOString())
        .order('strength', { ascending: true });

    if (error) {
        throw new Error('Failed to fetch skills needing practice');
    }

    return data.map(skill => ({
        id: skill.skill_id,
        title: skill.title || '',
        description: skill.description || '',
        strength: skill.strength,
        lastPracticed: new Date(skill.last_practiced),
        nextPracticeDue: new Date(skill.next_practice_due),
        xpReward: skill.xp_reward || 10,
        category: skill.category || '',
        order: skill.order || 0,
    }));
}

export async function getSkillProgress(userId: string): Promise<{
    totalSkills: number;
    averageStrength: number;
    skillsNeedingPractice: number;
    perfectSkills: number;
}> {
    const { data, error } = await supabase
        .from('user_skills')
        .select('strength')
        .eq('user_id', userId);

    if (error) {
        throw new Error('Failed to fetch skill progress');
    }

    const totalSkills = data.length;
    const averageStrength = data.reduce((sum, skill) => sum + skill.strength, 0) / totalSkills;
    const skillsNeedingPractice = data.filter(skill => skill.strength < 50).length;
    const perfectSkills = data.filter(skill => skill.strength === MAX_STRENGTH).length;

    return {
        totalSkills,
        averageStrength,
        skillsNeedingPractice,
        perfectSkills,
    };
} 