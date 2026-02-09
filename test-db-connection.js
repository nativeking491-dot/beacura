// Database Connectivity Test Script
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Database Connectivity Test\n');
console.log('='.repeat(50));

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables!');
    console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing');
    process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Anon Key:', supabaseAnonKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    try {
        // Test 1: Check users table
        console.log('Test 1: Checking users table...');
        const { count: userCount, error: userError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (userError) {
            console.error('❌ Users table error:', userError.message);
        } else {
            console.log(`✅ Users table accessible (${userCount} users)\n`);
        }

        // Test 2: Check chat_messages table
        console.log('Test 2: Checking chat_messages table...');
        const { count: messageCount, error: messageError } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true });

        if (messageError) {
            console.error('❌ chat_messages table error:', messageError.message);
            if (messageError.code === '42P01') {
                console.log('⚠️  Table does not exist. Run the migration SQL first!');
            }
        } else {
            console.log(`✅ chat_messages table accessible (${messageCount} messages)\n`);
        }

        // Test 3: Check chat_sessions table
        console.log('Test 3: Checking chat_sessions table...');
        const { count: sessionCount, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true });

        if (sessionError) {
            console.error('❌ chat_sessions table error:', sessionError.message);
            if (sessionError.code === '42P01') {
                console.log('⚠️  Table does not exist. Run the migration SQL first!');
            }
        } else {
            console.log(`✅ chat_sessions table accessible (${sessionCount} sessions)\n`);
        }

        // Test 4: Check crisis_logs table
        console.log('Test 4: Checking crisis_logs table...');
        const { count: crisisCount, error: crisisError } = await supabase
            .from('crisis_logs')
            .select('*', { count: 'exact', head: true });

        if (crisisError) {
            console.error('❌ crisis_logs table error:', crisisError.message);
        } else {
            console.log(`✅ crisis_logs table accessible (${crisisCount} logs)\n`);
        }

        // Summary
        console.log('='.repeat(50));
        console.log('📊 Summary:');
        console.log('  Users:', userError ? '❌' : '✅');
        console.log('  Chat Messages:', messageError ? '❌' : '✅');
        console.log('  Chat Sessions:', sessionError ? '❌' : '✅');
        console.log('  Crisis Logs:', crisisError ? '❌' : '✅');

        if (messageError || sessionError) {
            console.log('\n⚠️  ACTION REQUIRED:');
            console.log('Run the migration SQL in Supabase SQL Editor:');
            console.log('File: database-migrations/chat_messages.sql');
        } else {
            console.log('\n🎉 All tables are accessible and ready!');
        }

    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
    }
}

testConnection();
