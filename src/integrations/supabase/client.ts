// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://azytyerjtxahwsswwfrp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6eXR5ZXJqdHhhaHdzc3d3ZnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNzkxNDQsImV4cCI6MjA1NjY1NTE0NH0.SY9bevZmVTOeiYTu13jDp6nu5CzJA37vo7xJItuJFVo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);