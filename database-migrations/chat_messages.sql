-- Enhanced Recovery Chatbot Database Migration
-- Creates tables for persistent chat history

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  message TEXT NOT NULL,
  session_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_session 
  ON chat_messages(user_id, session_id);
  
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
  ON chat_messages(created_at DESC);

-- Create chat_sessions table for session management
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user 
  ON chat_sessions(user_id, last_message_at DESC);

-- Add comments for documentation
COMMENT ON TABLE chat_messages IS 'Stores individual chat messages between users and AI';
COMMENT ON TABLE chat_sessions IS 'Groups chat messages into conversation sessions';
COMMENT ON COLUMN chat_messages.sender IS 'Either "user" or "ai"';
COMMENT ON COLUMN chat_messages.session_id IS 'Groups messages into conversation threads';
