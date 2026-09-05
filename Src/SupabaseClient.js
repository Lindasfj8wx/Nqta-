import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hpavwfutxwtrjiqofizy.supabase.co/rest/v1/'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYXZ3ZnV0eHd0cmppcW9maXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxOTYzMTQsImV4cCI6MjEwMzc3MjMxNH0.RssCLKcZujQ657W_UzP2WZPvd2cxFLcdZ-VPe1P2xKE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
