import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Use service role for scheduled runs (no user JWT needed)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json().catch(() => ({}));
    const { groupId, date } = body;

    const closureDate = date ?? new Date().toISOString().slice(0, 10);

    // If groupId provided, close just that group. Otherwise close all active groups.
    const groups = groupId
      ? [{ id: groupId }]
      : await supabase
          .from('groups')
          .select('id')
          .eq('status', 'active')
          .then(({ data }) => data ?? []);

    const results = [];

    for (const group of groups) {
      const gid = group.id;

      // Fetch confirmed entries for this date
      const { data: entries } = await supabase
        .from('entries')
        .select('*')
        .eq('group_id', gid)
        .eq('status', 'confirmed')
        .gte('entry_date', `${closureDate}T00:00:00`)
        .lte('entry_date', `${closureDate}T23:59:59`);

      if (!entries?.length) continue;

      const totalAmount = entries.reduce((sum: number, e: Record<string, unknown>) =>
        sum + ((e.amount_in_base ?? e.amount) as number), 0);

      const entryCount = entries.length;
      const pendingCount = 0; // Only confirmed entries counted

      // Build per-category breakdown
      const byCategory: Record<string, number> = {};
      for (const e of entries) {
        const cat = (e.category as string) ?? 'other';
        byCategory[cat] = (byCategory[cat] ?? 0) + ((e.amount_in_base ?? e.amount) as number);
      }

      // Check if closure already exists
      const { data: existing } = await supabase
        .from('daily_closures')
        .select('id')
        .eq('group_id', gid)
        .eq('closure_date', closureDate)
        .maybeSingle();

      const closureData = {
        group_id: gid,
        closure_date: closureDate,
        total_amount: totalAmount,
        entry_count: entryCount,
        pending_count: pendingCount,
        summary_json: { byCategory, topEntries: entries.slice(0, 3) },
        currency: entries[0]?.currency ?? 'USD',
      };

      if (existing) {
        await supabase.from('daily_closures').update(closureData).eq('id', existing.id);
      } else {
        await supabase.from('daily_closures').insert(closureData);
      }

      results.push({ groupId: gid, totalAmount, entryCount });
    }

    return new Response(JSON.stringify({ success: true, closures: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('daily-closure error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
