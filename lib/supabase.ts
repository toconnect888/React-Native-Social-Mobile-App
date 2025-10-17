import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zzivyzdocapbhircrmbl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6aXZ5emRvY2FwYmhpcmNybWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg0NTE5NzMsImV4cCI6MjAyNDAyNzk3M30.G6qnbseJSC3tkqHakyd40ZGH_O6mo6ibodhx8X0cbMs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});