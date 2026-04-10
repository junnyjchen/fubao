import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.COZE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.COZE_SUPABASE_ANON_KEY || '';

export { createClient };

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
