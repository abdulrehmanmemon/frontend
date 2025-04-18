// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Segments Supabase Client
const segmentsUrl = import.meta.env.VITE_SUPABASE_URL_SEGMENTS;
const segmentsAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY_SEGMENTS;
export const supabaseSegments = createClient(segmentsUrl, segmentsAnonKey, {
  headers: {
    apikey: segmentsAnonKey,
  },
});

// Companies Supabase Client
const companiesUrl = import.meta.env.VITE_SUPABASE_URL_COMPANIES;
const companiesAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY_COMPANIES;
export const supabaseCompanies = createClient(companiesUrl, companiesAnonKey, {
  headers: {
    apikey: companiesAnonKey,
  },
});



