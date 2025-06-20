-- Create daily challenges table
CREATE TABLE daily_challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('vocabulary', 'grammar', 'listening', 'speaking')),
    xp_reward INTEGER NOT NULL,
    streak_bonus INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, created_at)
);

-- Create challenge progress table
CREATE TABLE challenge_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    total_steps INTEGER NOT NULL,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- Create challenge rewards table
CREATE TABLE challenge_rewards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    xp_earned INTEGER NOT NULL,
    streak_bonus INTEGER NOT NULL,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to create daily challenges
CREATE OR REPLACE FUNCTION create_daily_challenges()
RETURNS TRIGGER AS $$
BEGIN
    -- Create vocabulary challenge
    INSERT INTO daily_challenges (
        user_id,
        title,
        description,
        type,
        xp_reward,
        streak_bonus,
        expires_at
    ) VALUES (
        NEW.id,
        'Vocabulary Master',
        'Learn 10 new words today',
        'vocabulary',
        50,
        1,
        NOW() + INTERVAL '24 hours'
    );

    -- Create grammar challenge
    INSERT INTO daily_challenges (
        user_id,
        title,
        description,
        type,
        xp_reward,
        streak_bonus,
        expires_at
    ) VALUES (
        NEW.id,
        'Grammar Guru',
        'Complete 5 grammar exercises',
        'grammar',
        75,
        1,
        NOW() + INTERVAL '24 hours'
    );

    -- Create listening challenge
    INSERT INTO daily_challenges (
        user_id,
        title,
        description,
        type,
        xp_reward,
        streak_bonus,
        expires_at
    ) VALUES (
        NEW.id,
        'Listening Pro',
        'Practice listening for 10 minutes',
        'listening',
        100,
        2,
        NOW() + INTERVAL '24 hours'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create daily challenges for new users
CREATE TRIGGER create_daily_challenges_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_daily_challenges();

-- Function to update challenge progress
CREATE OR REPLACE FUNCTION update_challenge_progress(
    p_challenge_id UUID,
    p_user_id UUID,
    p_progress INTEGER
)
RETURNS VOID AS $$
DECLARE
    v_total_steps INTEGER;
    v_current_progress INTEGER;
BEGIN
    -- Get total steps for the challenge
    SELECT total_steps INTO v_total_steps
    FROM challenge_progress
    WHERE challenge_id = p_challenge_id AND user_id = p_user_id;

    -- Get current progress
    SELECT progress INTO v_current_progress
    FROM challenge_progress
    WHERE challenge_id = p_challenge_id AND user_id = p_user_id;

    -- Update progress
    UPDATE challenge_progress
    SET progress = LEAST(v_total_steps, v_current_progress + p_progress),
        last_updated_at = NOW()
    WHERE challenge_id = p_challenge_id AND user_id = p_user_id;

    -- Check if challenge is completed
    IF v_current_progress + p_progress >= v_total_steps THEN
        -- Mark challenge as completed
        UPDATE daily_challenges
        SET is_completed = TRUE,
            completed_at = NOW()
        WHERE id = p_challenge_id;

        -- Award rewards
        INSERT INTO challenge_rewards (
            challenge_id,
            user_id,
            xp_earned,
            streak_bonus
        )
        SELECT
            id,
            user_id,
            xp_reward,
            streak_bonus
        FROM daily_challenges
        WHERE id = p_challenge_id;

        -- Update user XP and streak
        UPDATE user_progress
        SET xp = xp + (
            SELECT xp_reward
            FROM daily_challenges
            WHERE id = p_challenge_id
        )
        WHERE user_id = p_user_id;

        -- Update streak
        UPDATE user_streaks
        SET current_streak = current_streak + (
            SELECT streak_bonus
            FROM daily_challenges
            WHERE id = p_challenge_id
        )
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's daily challenges
CREATE OR REPLACE FUNCTION get_user_daily_challenges(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    type TEXT,
    xp_reward INTEGER,
    streak_bonus INTEGER,
    is_completed BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress INTEGER,
    total_steps INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.title,
        dc.description,
        dc.type,
        dc.xp_reward,
        dc.streak_bonus,
        dc.is_completed,
        dc.created_at,
        dc.expires_at,
        dc.completed_at,
        COALESCE(cp.progress, 0),
        COALESCE(cp.total_steps, 0)
    FROM daily_challenges dc
    LEFT JOIN challenge_progress cp ON dc.id = cp.challenge_id
    WHERE dc.user_id = p_user_id
    AND dc.created_at >= NOW() - INTERVAL '24 hours'
    ORDER BY dc.created_at DESC;
END;
$$ LANGUAGE plpgsql; 