-- Create practice items table
CREATE TABLE practice_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('vocabulary', 'grammar', 'listening', 'speaking')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    content JSONB NOT NULL,
    mastery_level INTEGER DEFAULT 0,
    next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    review_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0
);

-- Create practice history table
CREATE TABLE practice_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    practice_item_id UUID REFERENCES practice_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    success BOOLEAN NOT NULL,
    response_time INTEGER,
    difficulty_before TEXT NOT NULL,
    difficulty_after TEXT NOT NULL,
    mastery_before INTEGER NOT NULL,
    mastery_after INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to calculate next review time based on spaced repetition
CREATE OR REPLACE FUNCTION calculate_next_review(
    p_mastery_level INTEGER,
    p_review_count INTEGER,
    p_success_count INTEGER
)
RETURNS INTERVAL AS $$
DECLARE
    v_interval INTERVAL;
BEGIN
    -- Base intervals for different mastery levels
    CASE
        WHEN p_mastery_level >= 90 THEN
            v_interval := INTERVAL '7 days';
        WHEN p_mastery_level >= 75 THEN
            v_interval := INTERVAL '3 days';
        WHEN p_mastery_level >= 50 THEN
            v_interval := INTERVAL '1 day';
        WHEN p_mastery_level >= 25 THEN
            v_interval := INTERVAL '12 hours';
        ELSE
            v_interval := INTERVAL '6 hours';
    END CASE;

    -- Adjust interval based on review count and success rate
    IF p_review_count > 0 THEN
        v_interval := v_interval * (1 + (p_success_count::FLOAT / p_review_count));
    END IF;

    RETURN v_interval;
END;
$$ LANGUAGE plpgsql;

-- Function to update practice item after review
CREATE OR REPLACE FUNCTION update_practice_item(
    p_item_id UUID,
    p_user_id UUID,
    p_success BOOLEAN,
    p_response_time INTEGER
)
RETURNS VOID AS $$
DECLARE
    v_item practice_items;
    v_new_mastery INTEGER;
    v_new_difficulty TEXT;
    v_next_review TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current item state
    SELECT * INTO v_item
    FROM practice_items
    WHERE id = p_item_id AND user_id = p_user_id;

    -- Calculate new mastery level
    IF p_success THEN
        v_new_mastery := LEAST(100, v_item.mastery_level + 10);
    ELSE
        v_new_mastery := GREATEST(0, v_item.mastery_level - 5);
    END IF;

    -- Calculate new difficulty
    CASE
        WHEN v_new_mastery >= 90 AND v_item.difficulty = 'medium' THEN
            v_new_difficulty := 'hard';
        WHEN v_new_mastery >= 75 AND v_item.difficulty = 'easy' THEN
            v_new_difficulty := 'medium';
        WHEN v_new_mastery < 25 AND v_item.difficulty = 'medium' THEN
            v_new_difficulty := 'easy';
        WHEN v_new_mastery < 50 AND v_item.difficulty = 'hard' THEN
            v_new_difficulty := 'medium';
        ELSE
            v_new_difficulty := v_item.difficulty;
    END CASE;

    -- Calculate next review time
    v_next_review := NOW() + calculate_next_review(
        v_new_mastery,
        v_item.review_count + 1,
        v_item.success_count + (CASE WHEN p_success THEN 1 ELSE 0 END)
    );

    -- Update practice item
    UPDATE practice_items
    SET
        mastery_level = v_new_mastery,
        difficulty = v_new_difficulty,
        next_review = v_next_review,
        last_reviewed_at = NOW(),
        review_count = review_count + 1,
        success_count = success_count + (CASE WHEN p_success THEN 1 ELSE 0 END),
        failure_count = failure_count + (CASE WHEN p_success THEN 0 ELSE 1 END)
    WHERE id = p_item_id;

    -- Record practice history
    INSERT INTO practice_history (
        practice_item_id,
        user_id,
        success,
        response_time,
        difficulty_before,
        difficulty_after,
        mastery_before,
        mastery_after
    ) VALUES (
        p_item_id,
        p_user_id,
        p_success,
        p_response_time,
        v_item.difficulty,
        v_new_difficulty,
        v_item.mastery_level,
        v_new_mastery
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get practice statistics
CREATE OR REPLACE FUNCTION get_practice_stats(p_user_id UUID)
RETURNS TABLE (
    total_items INTEGER,
    mastered_items INTEGER,
    average_mastery NUMERIC,
    next_review_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER as total_items,
        COUNT(*) FILTER (WHERE mastery_level >= 90)::INTEGER as mastered_items,
        ROUND(AVG(mastery_level)::NUMERIC, 1) as average_mastery,
        COUNT(*) FILTER (WHERE next_review <= NOW())::INTEGER as next_review_count
    FROM practice_items
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create practice items from completed lessons
CREATE OR REPLACE FUNCTION create_practice_items_from_lesson(
    p_lesson_id UUID,
    p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_exercise RECORD;
BEGIN
    -- Create practice items for each exercise in the lesson
    FOR v_exercise IN
        SELECT * FROM exercises
        WHERE lesson_id = p_lesson_id
    LOOP
        INSERT INTO practice_items (
            user_id,
            title,
            type,
            difficulty,
            content
        ) VALUES (
            p_user_id,
            v_exercise.title,
            v_exercise.type,
            'easy',
            v_exercise.content
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create practice items when a lesson is completed
CREATE OR REPLACE FUNCTION create_practice_items_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_completed AND NOT OLD.is_completed THEN
        PERFORM create_practice_items_from_lesson(NEW.id, NEW.user_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_practice_items_trigger
    AFTER UPDATE ON lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION create_practice_items_trigger(); 