import { NextResponse } from 'next/server';
import { EmailParserService } from '@/services/emailParserService';
import { createClient } from '@supabase/supabase-js';

// Servis rolü ile Supabase (RLS bypass için gerekebilir, veya anon key ile)
// Şimdilik process.env'den alalım
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // veya SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // SendGrid Inbound Parse format simulation
        // body.to = "123@inbound.bizimapp.com"
        // body.text = "GÜN SONU RAPORU..."

        const toEmail = body.to;
        const rawContent = body.text || body.html || '';

        if (!toEmail || !rawContent) {
            return NextResponse.json({ error: 'Missing email fields' }, { status: 400 });
        }

        const branchId = EmailParserService.extractBranchId(toEmail);

        if (!branchId) {
            return NextResponse.json({ error: 'Invalid branch email format' }, { status: 400 });
        }

        const parsedData = EmailParserService.parseZReport(rawContent);

        // DB'ye Kaydet
        const { data, error } = await supabase
            .from('z_reports')
            .insert({
                branch_id: branchId, // UUID olması gerekebilir, şimdilik string ID varsayıyoruz
                date: parsedData.date, // Format: YYYY-MM-DD olmalı, parser DD.MM.YYYY veriyorsa çevirmek lazım
                receipt_no: parsedData.receipt_no,
                raw_email_content: rawContent,
                total_amount: parsedData.total_amount,
                credit_card_total: parsedData.credit_card_total,
                cash_total: parsedData.cash_total,
                source: 'email_auto',
                status: parsedData.status
            })
            .select()
            .single();

        if (error) {
            console.error('DB Insert Error:', error);
            return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data.id, parsed: parsedData });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
