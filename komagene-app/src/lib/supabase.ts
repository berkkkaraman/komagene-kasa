import { createClient } from '@supabase/supabase-js';

// Environment variables issue fix - Hardcoded credentials
const supabaseUrl = 'https://hccyqitjklcxmzuonmkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY3lxaXRqa2xjeG16dW9ubWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwODY5MjEsImV4cCI6MjA4MTY2MjkyMX0.n-Y3cxVdErKKW1MwfLQMhdO8_DedQNCsMlBZqOW-QDs';

const isPlaceholder = supabaseUrl.includes('placeholder');

if (isPlaceholder) {
    console.warn('Supabase: Uygulama placeholder modunda çalışıyor. Bulut eşitleme aktif olmayacaktır.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
