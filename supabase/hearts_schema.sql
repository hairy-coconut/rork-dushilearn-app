-- Create user_hearts table
CREATE TABLE IF NOT EXISTS user_hearts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_hearts INTEGER NOT NULL DEFAULT 5,
    max_hearts INTEGER NOT NULL DEFAULT 5,
    last_refill_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    hearts_refill_rate INTEGER NOT NULL DEFAULT 30, -- minutes per heart
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create heart_transactions table for tracking heart usage and refills
CREATE TABLE IF NOT EXISTS heart_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('use', 'refill', 'bonus', 'purchase')),
    amount INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create heart_boosters table for power-ups that affect hearts
CREATE TABLE IF NOT EXISTS heart_boosters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    booster_type TEXT NOT NULL CHECK (booster_type IN ('refill_rate', 'max_hearts', 'instant_refill')),
    amount INTEGER NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_hearts
CREATE TRIGGER update_user_hearts_updated_at
    BEFORE UPDATE ON user_hearts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle heart usage
CREATE OR REPLACE FUNCTION use_heart(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_hearts INTEGER;
BEGIN
    -- Get current hearts
    SELECT current_hearts INTO current_hearts
    FROM user_hearts
    WHERE user_id = use_heart.user_id;

    -- Check if user has hearts
    IF current_hearts <= 0 THEN
        RETURN FALSE;
    END IF;

    -- Update hearts
    UPDATE user_hearts
    SET current_hearts = current_hearts - 1
    WHERE user_id = use_heart.user_id;

    -- Record transaction
    INSERT INTO heart_transactions (user_id, transaction_type, amount, reason)
    VALUES (use_heart.user_id, 'use', 1, 'Lesson attempt');

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to refill hearts
CREATE OR REPLACE FUNCTION refill_hearts(user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Update hearts to max
    UPDATE user_hearts
    SET current_hearts = max_hearts,
        last_refill_time = NOW()
    WHERE user_id = refill_hearts.user_id;

    -- Record transaction
    INSERT INTO heart_transactions (user_id, transaction_type, amount, reason)
    VALUES (refill_hearts.user_id, 'refill', 5, 'Manual refill');
END;
$$ LANGUAGE plpgsql;

-- Create function to apply heart booster
CREATE OR REPLACE FUNCTION apply_heart_booster(
    user_id UUID,
    booster_type TEXT,
    amount INTEGER,
    duration_minutes INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate expiration time if duration is provided
    IF duration_minutes IS NOT NULL THEN
        expires_at := NOW() + (duration_minutes || ' minutes')::INTERVAL;
    END IF;

    -- Insert booster
    INSERT INTO heart_boosters (user_id, booster_type, amount, expires_at)
    VALUES (apply_heart_booster.user_id, booster_type, amount, expires_at);

    -- Apply booster effect
    CASE booster_type
        WHEN 'refill_rate' THEN
            UPDATE user_hearts
            SET hearts_refill_rate = GREATEST(1, hearts_refill_rate - amount)
            WHERE user_id = apply_heart_booster.user_id;
        WHEN 'max_hearts' THEN
            UPDATE user_hearts
            SET max_hearts = max_hearts + amount,
                current_hearts = current_hearts + amount
            WHERE user_id = apply_heart_booster.user_id;
        WHEN 'instant_refill' THEN
            UPDATE user_hearts
            SET current_hearts = LEAST(max_hearts, current_hearts + amount)
            WHERE user_id = apply_heart_booster.user_id;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up expired boosters
CREATE OR REPLACE FUNCTION cleanup_expired_boosters()
RETURNS VOID AS $$
BEGIN
    -- Remove expired boosters
    DELETE FROM heart_boosters
    WHERE expires_at < NOW();

    -- Reset any temporary effects
    UPDATE user_hearts
    SET hearts_refill_rate = 30
    WHERE user_id IN (
        SELECT DISTINCT user_id
        FROM heart_boosters
        WHERE booster_type = 'refill_rate'
        AND expires_at < NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_hearts_user_id ON user_hearts(user_id);
CREATE INDEX IF NOT EXISTS idx_heart_transactions_user_id ON heart_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_heart_boosters_user_id ON heart_boosters(user_id);
CREATE INDEX IF NOT EXISTS idx_heart_boosters_expires_at ON heart_boosters(expires_at); 