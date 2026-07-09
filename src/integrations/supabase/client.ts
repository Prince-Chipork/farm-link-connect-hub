import * as Supabase from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = 'https://tqsozciafuxrxumnxkjr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc296Y2lhZnV4cnh1bW54a2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NDY0NTAsImV4cCI6MjA5OTEyMjQ1MH0.-vPeaBQQ9nrzhmQhuVJu1PAB4rsOCCTJ92O3u7akCK4';

export const supabase = Supabase.createClient<Database>(supabaseUrl, supabaseAnonKey)
