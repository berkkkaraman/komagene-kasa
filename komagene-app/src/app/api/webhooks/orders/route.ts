import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Beklenen Format:
        // {
        //   "source": "yemeksepeti",
        //   "branch_id": "uuid...",
        //   "order_id": "YS-12345", 
        //   "items": [...],
        //   "total": 150.50,
        //   "customer_note": "Zili çalma"
        // }

        const { source, branch_id, order_id, items, total, customer_note, table_no } = body;

        if (!source || !total) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Orders tablosuna ekle
        const { data, error } = await supabase
            .from('orders')
            .insert({
                branch_id: branch_id, // Opsiyonel: Eğer extension branch_id biliyorsa
                table_no: table_no || `Online: ${source.toUpperCase()}`, // "Masa 1" yerine "Online: YEMEKSEPETI"
                items: items || [],
                total_amount: total,
                status: 'pending',
                source: source, // 'yemeksepeti', 'getir' vb.
                customer_note: customer_note
            })
            .select()
            .single();

        if (error) {
            console.error('DB Insert Error:', error);
            return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
        }

        // Supabase Realtime otomatik tetiklenecek (INSERT event)
        // Ekstra bir socket mesajına gerek yok (Postgres Changes)

        return NextResponse.json({ success: true, id: data.id });

    } catch (error) {
        console.error('Courier Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
