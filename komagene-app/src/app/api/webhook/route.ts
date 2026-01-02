import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await request.json();
        const { branch_id, date, income, expenses, source } = payload;

        if (!branch_id || !date) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if record exists
        const { data: existing } = await supabase
            .from("daily_records")
            .select("*")
            .eq("branch_id", branch_id)
            .eq("date", date)
            .single();

        if (existing) {
            // Update existing record
            const { error } = await supabase
                .from("daily_records")
                .update({
                    income: { ...existing.income, ...income },
                    expenses: [...(existing.expenses || []), ...(expenses || [])],
                    is_synced: false
                })
                .eq("id", existing.id);

            if (error) throw error;
            return NextResponse.json({ success: true, action: "updated", id: existing.id });
        } else {
            // Create new record
            const { data: newRecord, error } = await supabase
                .from("daily_records")
                .insert({
                    branch_id,
                    date,
                    income: income || { cash: 0, creditCard: 0, online: {}, source: source || 'webhook' },
                    expenses: expenses || [],
                    is_synced: false,
                    is_closed: false
                })
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, action: "created", id: newRecord.id });
        }
    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
