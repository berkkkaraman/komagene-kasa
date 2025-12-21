import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { branch_id, source, external_id, items, total_amount, table_no } = body;

        // 1. Veritabanına Yaz
        const { data, error } = await supabase
            .from('orders')
            .insert({
                branch_id,
                source: source || 'external_webhook',
                external_id,
                items,
                total_amount,
                table_no: table_no || 'ONLINE',
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        // 2. Realtime Notification zaten Supabase tarafından (table triggers) halledilecek.
        // Ama uygulama içinden bir toast tetiklemek için response döndürüyoruz.
        return NextResponse.json({
            success: true,
            message: 'Order received and synchronized',
            orderId: data.id
        });

    } catch (err: any) {
        console.error('Webhook Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
