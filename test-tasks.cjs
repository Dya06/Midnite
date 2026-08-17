const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://qyrspvuworhijzhhiauw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5cnNwdnV3b3JoaWp6aGhpYXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODY3ODUsImV4cCI6MjEwMjI2Mjc4NX0.5MSlpT48x0BwAaJFnJr8Ukv0Ak6PIkJ8RnZvxVSRw48';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
supabase.from('tasks').select('*').limit(1).then(res => console.log(Object.keys(res.data[0] || {})));
