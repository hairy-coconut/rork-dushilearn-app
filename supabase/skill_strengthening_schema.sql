-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_skills table for tracking skill progress
CREATE TABLE IF NOT EXISTS user_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    strength INTEGER NOT NULL DEFAULT 100,
    last_practiced TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    next_practice_due TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- Create practice_sessions table for tracking practice history
CREATE TABLE IF NOT EXISTS practice_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    time_spent INTEGER NOT NULL, -- in seconds
    mistakes INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create skill_categories table
CREATE TABLE IF NOT EXISTS skill_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_skills_updated_at
    BEFORE UPDATE ON user_skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_categories_updated_at
    BEFORE UPDATE ON skill_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate skill decay
CREATE OR REPLACE FUNCTION calculate_skill_decay(
    last_practiced TIMESTAMP WITH TIME ZONE,
    current_strength INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    days_passed INTEGER;
    decay_rate INTEGER := 5; -- points per day
    decay_amount INTEGER;
BEGIN
    days_passed := EXTRACT(EPOCH FROM (NOW() - last_practiced)) / 86400;
    decay_amount := days_passed * decay_rate;
    RETURN GREATEST(0, current_strength - decay_amount);
END;
$$ LANGUAGE plpgsql;

-- Create function to update skill strength
CREATE OR REPLACE FUNCTION update_skill_strength(
    user_id UUID,
    skill_id UUID,
    new_strength INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE user_skills
    SET strength = new_strength,
        last_practiced = NOW(),
        next_practice_due = NOW() + INTERVAL '24 hours'
    WHERE user_id = update_skill_strength.user_id
    AND skill_id = update_skill_strength.skill_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get skills needing practice
CREATE OR REPLACE FUNCTION get_skills_needing_practice(user_id UUID)
RETURNS TABLE (
    skill_id UUID,
    title TEXT,
    description TEXT,
    strength INTEGER,
    last_practiced TIMESTAMP WITH TIME ZONE,
    next_practice_due TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id as skill_id,
        s.title,
        s.description,
        us.strength,
        us.last_practiced,
        us.next_practice_due
    FROM user_skills us
    JOIN skills s ON s.id = us.skill_id
    WHERE us.user_id = get_skills_needing_practice.user_id
    AND us.next_practice_due <= NOW()
    ORDER BY us.strength ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get skill progress summary
CREATE OR REPLACE FUNCTION get_skill_progress_summary(user_id UUID)
RETURNS TABLE (
    total_skills INTEGER,
    average_strength NUMERIC,
    skills_needing_practice INTEGER,
    perfect_skills INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH skill_stats AS (
        SELECT
            COUNT(*) as total,
            AVG(strength) as avg_strength,
            COUNT(*) FILTER (WHERE strength < 50) as needs_practice,
            COUNT(*) FILTER (WHERE strength = 100) as perfect
        FROM user_skills
        WHERE user_id = get_skill_progress_summary.user_id
    )
    SELECT
        total,
        avg_strength,
        needs_practice,
        perfect
    FROM skill_stats;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_next_practice ON user_skills(next_practice_due);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_skill_id ON practice_sessions(skill_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_order ON skills(order_index); 