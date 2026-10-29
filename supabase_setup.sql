-- ============================================================================
-- AI-Powered Flashcard & Revision Quiz Generator - Supabase PostgreSQL Setup
-- ============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DECKS TABLE
CREATE TABLE IF NOT EXISTS decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    topic VARCHAR(255),
    category VARCHAR(100) DEFAULT 'General',
    difficulty_level VARCHAR(20) DEFAULT 'Medium' CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard')),
    source_type VARCHAR(50) CHECK (source_type IN ('topic', 'notes')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FLASHCARDS TABLE
CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    difficulty_status VARCHAR(20) DEFAULT 'unmarked' CHECK (difficulty_status IN ('unmarked', 'easy', 'difficult')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. QUIZ QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of 4 options: ["A", "B", "C", "D"]
    correct_option_index INT NOT NULL CHECK (correct_option_index >= 0 AND correct_option_index <= 3),
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. USER PROGRESS / QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    deck_id UUID REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    time_spent_seconds INT DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_deck_id ON quiz_questions(deck_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_deck_id ON quiz_attempts(deck_id);

-- ============================================================================
-- Row Level Security (RLS) & Data Isolation Policies
-- ============================================================================
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Decks Policy
DROP POLICY IF EXISTS "Users can manage their own decks" ON decks;
CREATE POLICY "Users can manage their own decks" ON decks
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Flashcards Policy (via deck ownership)
DROP POLICY IF EXISTS "Users can manage flashcards in their decks" ON flashcards;
CREATE POLICY "Users can manage flashcards in their decks" ON flashcards
    FOR ALL USING (
        EXISTS (SELECT 1 FROM decks WHERE decks.id = flashcards.deck_id AND decks.user_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM decks WHERE decks.id = flashcards.deck_id AND decks.user_id = auth.uid())
    );

-- Quiz Questions Policy (via deck ownership)
DROP POLICY IF EXISTS "Users can manage quiz questions in their decks" ON quiz_questions;
CREATE POLICY "Users can manage quiz questions in their decks" ON quiz_questions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM decks WHERE decks.id = quiz_questions.deck_id AND decks.user_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM decks WHERE decks.id = quiz_questions.deck_id AND decks.user_id = auth.uid())
    );

-- Quiz Attempts Policy
DROP POLICY IF EXISTS "Users can manage their own attempts" ON quiz_attempts;
CREATE POLICY "Users can manage their own attempts" ON quiz_attempts
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

